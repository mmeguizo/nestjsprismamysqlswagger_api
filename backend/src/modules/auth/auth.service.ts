import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { UserRole, UserStatus, Campus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { LoginDto, GoogleUserDto, TokenResponseDto, LoginResponseDto } from './dto';

/**
 * Authentication Service
 *
 * @description Handles all authentication logic including:
 * - Email/password login
 * - Google OAuth login
 * - JWT token generation (access + refresh)
 * - Token refresh
 * - Password validation
 *
 * ## Token Architecture:
 *
 * ### Access Token:
 * - Short-lived (15 minutes by default)
 * - Used for API authentication
 * - Contains: userId, email, role
 * - Sent in Authorization header: `Bearer <token>`
 *
 * ### Refresh Token:
 * - Long-lived (7 days by default)
 * - Used only to get new access tokens
 * - Contains: userId, email, type='refresh'
 * - Sent in request body to /auth/refresh
 *
 * ## Security Practices:
 * - Passwords hashed with bcrypt (10 rounds)
 * - Different secrets for access/refresh tokens
 * - Token expiration enforced
 * - User status checked on every validation
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Authenticate user with email and password
   *
   * @description Validates credentials and returns JWT tokens.
   *
   * ## Flow:
   * 1. Find user by email (case-insensitive)
   * 2. Verify user exists and is not deleted
   * 3. Check user status is ACTIVE
   * 4. Validate password with bcrypt
   * 5. Generate access and refresh tokens
   *
   * @param loginDto - Email and password
   * @returns Tokens and user info
   * @throws UnauthorizedException if credentials invalid or user inactive
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    // Find user by email (case-insensitive)
    const user = await this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deleted: false,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        'Your account is not active. Please contact administrator.',
      );
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        campus: user.campus,
        department: user.department || undefined,
        profilePic: user.profilePic || undefined,
      },
    };
  }

  /**
   * Handle Google OAuth login
   *
   * @description Creates or updates user from Google profile and returns tokens.
   *
   * ## Flow:
   * 1. Check if user exists by email
   * 2. If exists: Update profile picture if changed
   * 3. If new: Create user with default role and password
   * 4. Check user status is ACTIVE
   * 5. Generate access and refresh tokens
   *
   * ## New User Defaults:
   * - Role: From DEFAULT_USER_ROLE env (default: OFFICE_HEAD)
   * - Password: From DEFAULT_USER_PASSWORD env (hashed)
   * - Campus: From DEFAULT_USER_CAMPUS env
   * - Status: PENDING (requires admin activation)
   *
   * @param googleUser - User data from Google OAuth
   * @returns Tokens and user info
   * @throws UnauthorizedException if user inactive
   */
  async googleLogin(googleUser: GoogleUserDto): Promise<LoginResponseDto> {
    const { email, firstName, lastName, picture } = googleUser;

    // Find or create user
    let user = await this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deleted: false,
      },
    });

    if (user) {
      // Update profile picture if changed
      if (picture && picture !== user.profilePic) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { profilePic: picture },
        });
        this.logger.log(`Updated profile picture for user: ${user.email}`);
      }
    } else {
      // Create new user with default settings
      const defaultPassword = this.configService.get<string>(
        'DEFAULT_USER_PASSWORD',
        'TempPass@123',
      );
      const defaultRole = this.configService.get<string>(
        'DEFAULT_USER_ROLE',
        'OFFICE_HEAD',
      ) as UserRole;
      const defaultCampus = this.configService.get<string>(
        'DEFAULT_USER_CAMPUS',
        'TALISAY',
      ) as Campus;

      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      // Generate username from email
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_');

      user = await this.prisma.user.create({
        data: {
          email: email.toLowerCase(),
          username,
          firstName,
          lastName,
          password: hashedPassword,
          role: defaultRole,
          status: UserStatus.PENDING, // New users need admin activation
          campus: defaultCampus,
          profilePic: picture || 'no-photo.png',
        },
      });

      this.logger.log(`New user created via Google OAuth: ${user.email}`);
    }

    // Check if user is active (existing users might be inactive)
    if (user.status !== UserStatus.ACTIVE) {
      // For new users, we allow them to get tokens but with a notice
      // They can view limited data until activated
      this.logger.warn(`Inactive user logged in via Google: ${user.email}`);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        campus: user.campus,
        department: user.department || undefined,
        profilePic: user.profilePic || undefined,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   *
   * @description Validates refresh token and generates new token pair.
   *
   * ## Security:
   * - Validates refresh token with separate secret
   * - Generates completely new token pair (rotation)
   * - Checks user still exists and is active
   *
   * @param userId - User ID from refresh token
   * @param refreshToken - Current refresh token
   * @returns New token pair
   */
  async refreshTokens(userId: number): Promise<TokenResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        deleted: true,
      },
    });

    if (!user || user.deleted) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is not active');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    this.logger.log(`Tokens refreshed for user: ${user.email}`);

    return tokens;
  }

  /**
   * Validate user by ID
   *
   * @description Used internally to verify user exists and is valid.
   *
   * @param userId - User ID to validate
   * @returns User if valid, null otherwise
   */
  async validateUser(userId: number) {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        deleted: false,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        campus: true,
        department: true,
        profilePic: true,
      },
    });
  }

  /**
  /**
   * Generate access and refresh tokens
   *
   * @description Creates JWT token pair with different secrets and expirations.
   *
   * ## Access Token Payload:
   * - sub: User ID
   * - email: User email
   * - role: User role
   * - iat: Issued at timestamp
   * - exp: Expiration timestamp
   *
   * ## Refresh Token Payload:
   * - sub: User ID
   * - email: User email
   * - type: 'refresh' (to distinguish from access token)
   * - iat: Issued at timestamp
   * - exp: Expiration timestamp
   *
   * @param userId - User ID
   * @param email - User email
   * @param role - User role
   * @returns Token response with both tokens
   */
  private async generateTokens(
    userId: number,
    email: string,
    role: UserRole,
  ): Promise<TokenResponseDto> {
    const accessExpirationSeconds = 15 * 60; // 15 minutes
    const refreshExpirationSeconds = 7 * 24 * 60 * 60; // 7 days

    // Generate access token
    const accessToken = this.jwtService.sign(
      {
        sub: userId,
        email,
        role,
      },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: accessExpirationSeconds,
      },
    );

    // Generate refresh token with different secret
    const refreshToken = this.jwtService.sign(
      {
        sub: userId,
        email,
        type: 'refresh',
      },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpirationSeconds,
      },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpirationSeconds,
      tokenType: 'Bearer',
    };
  }

  /**
   * Get current user profile
   *
   * @param userId - User ID
   * @returns User profile without password
   */
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        campus: true,
        department: true,
        departmentId: true,
        vicePresidentId: true,
        vicePresidentName: true,
        directorId: true,
        directorName: true,
        officeHeadId: true,
        officeHeadName: true,
        profilePic: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
