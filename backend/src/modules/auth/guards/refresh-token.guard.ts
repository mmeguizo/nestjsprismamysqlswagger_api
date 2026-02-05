import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Refresh Token Guard
 *
 * @description Protects the token refresh endpoint by validating refresh tokens.
 * Uses the 'jwt-refresh' strategy defined in RefreshTokenStrategy.
 *
 * ## Usage:
 * ```typescript
 * @UseGuards(RefreshTokenGuard)
 * @Post('refresh')
 * refreshTokens(@Request() req) {
 *   // req.user contains user data + refreshToken
 *   return this.authService.refreshTokens(req.user.id, req.user.refreshToken);
 * }
 * ```
 *
 * ## Request Body:
 * ```json
 * {
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * ```
 *
 * ## Error Responses:
 * - 401 Unauthorized: Missing, invalid, or expired refresh token
 *
 * @see RefreshTokenStrategy - Strategy that validates the refresh token
 */
@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {}
