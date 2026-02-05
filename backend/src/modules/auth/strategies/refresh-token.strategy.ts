import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * JWT Refresh Token Strategy
 *
 * @description This strategy validates JWT refresh tokens for obtaining new access tokens.
 * Refresh tokens have a longer expiration (7 days by default) and use a different secret.
 *
 * ## How it works:
 * 1. Client sends POST to /auth/refresh with refreshToken in body
 * 2. Strategy extracts and verifies the refresh token
 * 3. If valid, returns user payload with the refresh token attached
 * 4. AuthService uses this to generate new access/refresh token pair
 *
 * ## Security Considerations:
 * - Uses different secret (JWT_REFRESH_SECRET) than access tokens
 * - Refresh tokens should be stored securely on client (httpOnly cookie preferred)
 * - Can implement token rotation (invalidate old refresh token on use)
 * - Can implement token revocation (store in database)
 *
 * ## Token Payload Structure:
 * ```json
 * {
 *   "sub": 1,           // User ID
 *   "email": "user@example.com",
 *   "type": "refresh",  // Token type identifier
 *   "iat": 1234567890,
 *   "exp": 1235172690   // 7 days from iat
 * }
 * ```
 *
 * @see RefreshTokenGuard - Guard that uses this strategy
 */
export interface RefreshTokenPayload {
  sub: number;
  email: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  /**
   * Validate refresh token and return user with token
   *
   * @description Called automatically by Passport after token verification.
   * Returns user data along with the refresh token for rotation.
   *
   * @param req - Express request object
   * @param payload - Decoded refresh token payload
   * @returns User object with refreshToken attached
   * @throws UnauthorizedException if user not found, inactive, or invalid token type
   */
  async validate(req: Request, payload: RefreshTokenPayload) {
    // Verify this is actually a refresh token
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const refreshToken = req.body.refreshToken;

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

    // Return user with refresh token for potential token rotation
    return { ...user, refreshToken };
  }
}
