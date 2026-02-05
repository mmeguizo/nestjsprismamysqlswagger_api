import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Google OAuth Guard
 *
 * @description Initiates and handles Google OAuth 2.0 authentication flow.
 * Uses the 'google' strategy defined in GoogleStrategy.
 *
 * ## OAuth Flow:
 *
 * ### Step 1: Initiate Login (GET /auth/google)
 * ```typescript
 * @UseGuards(GoogleAuthGuard)
 * @Get('google')
 * googleAuth() {
 *   // Guard redirects to Google login page
 *   // No code needed here
 * }
 * ```
 *
 * ### Step 2: Handle Callback (GET /auth/google/callback)
 * ```typescript
 * @UseGuards(GoogleAuthGuard)
 * @Get('google/callback')
 * googleAuthCallback(@Request() req) {
 *   // After successful Google auth, req.user contains Google profile
 *   return this.authService.googleLogin(req.user);
 * }
 * ```
 *
 * ## User Flow:
 * 1. Frontend opens /api/v1/auth/google (popup or redirect)
 * 2. User sees Google login/consent screen
 * 3. After consent, Google redirects to /api/v1/auth/google/callback
 * 4. Backend creates/updates user and returns JWT tokens
 * 5. Frontend receives tokens and stores them
 *
 * ## req.user Data (from GoogleStrategy):
 * ```json
 * {
 *   "googleId": "123456789",
 *   "email": "user@gmail.com",
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "picture": "https://..."
 * }
 * ```
 *
 * @see GoogleStrategy - Strategy that processes Google profile
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  /**
   * Handle Google OAuth activation
   *
   * @description Initiates the OAuth flow or processes the callback.
   * On initial request, redirects to Google.
   * On callback, processes the authorization code.
   *
   * @param context - Execution context
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;
    return result;
  }
}
