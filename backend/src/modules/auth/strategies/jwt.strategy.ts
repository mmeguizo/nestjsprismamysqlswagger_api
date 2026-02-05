import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * JWT Access Token Strategy
 *
 * @description This strategy validates JWT access tokens from the Authorization header.
 * It extracts the token, verifies it using the JWT_SECRET, and returns the user payload.
 *
 * ## How it works:
 * 1. Client sends request with `Authorization: Bearer <access_token>` header
 * 2. Strategy extracts the token from the header
 * 3. Token is verified using JWT_SECRET
 * 4. If valid, user payload is attached to request.user
 * 5. If invalid or expired, UnauthorizedException is thrown
 *
 * ## Token Payload Structure:
 * ```json
 * {
 *   "sub": 1,           // User ID
 *   "email": "user@example.com",
 *   "role": "ADMIN",
 *   "iat": 1234567890,  // Issued at
 *   "exp": 1234568790   // Expiration
 * }
 * ```
 *
 * @see JwtAuthGuard - Guard that uses this strategy
 */
export interface JwtPayload {
  sub: number; // User ID
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Validate JWT payload and return user
   *
   * @description Called automatically by Passport after token verification.
   * The returned value is attached to request.user.
   *
   * @param payload - Decoded JWT payload
   * @returns User object (without password) to attach to request
   * @throws UnauthorizedException if user not found or inactive
   */
  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
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
        deleted: true,
      },
    });

    if (!user || user.deleted) {
      throw new UnauthorizedException('User not found or has been deleted');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }

    return user;
  }
}
