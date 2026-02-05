import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

/**
 * Google OAuth 2.0 Strategy
 *
 * @description This strategy handles Google OAuth authentication flow.
 * It redirects users to Google for authentication and processes the callback.
 *
 * ## OAuth Flow:
 * 1. User clicks "Login with Google" → redirected to GET /auth/google
 * 2. GoogleAuthGuard triggers this strategy → user redirected to Google login
 * 3. User authenticates with Google and grants permission
 * 4. Google redirects back to GOOGLE_CALLBACK_URL with authorization code
 * 5. Strategy exchanges code for access token and fetches user profile
 * 6. validate() method processes profile and returns user data
 * 7. AuthService creates/updates user and generates JWT tokens
 *
 * ## Required Environment Variables:
 * - GOOGLE_CLIENT_ID: From Google Cloud Console
 * - GOOGLE_CLIENT_SECRET: From Google Cloud Console
 * - GOOGLE_CALLBACK_URL: Must match redirect URI in Google Console
 *
 * ## Google Profile Data Available:
 * ```json
 * {
 *   "id": "123456789",
 *   "displayName": "John Doe",
 *   "name": { "familyName": "Doe", "givenName": "John" },
 *   "emails": [{ "value": "john@gmail.com", "verified": true }],
 *   "photos": [{ "value": "https://..." }]
 * }
 * ```
 *
 * ## Security Notes:
 * - Access tokens from Google are not stored (we generate our own JWT)
 * - Only email scope is required; profile scope for name/photo
 * - Users are created with default role if they don't exist
 *
 * @see GoogleAuthGuard - Guard that triggers this strategy
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Google OAuth credentials are not properly configured');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  /**
   * Process Google profile and extract user data
   *
   * @description Called automatically after successful Google authentication.
   * Extracts relevant user information from Google profile.
   *
   * @param accessToken - Google access token (not stored)
   * @param refreshToken - Google refresh token (not stored)
   * @param profile - Google user profile
   * @param done - Passport callback
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, name, emails, photos } = profile;

    // Extract user data from Google profile
    const googleUser = {
      googleId: id,
      email: emails?.[0]?.value || '',
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      picture: photos?.[0]?.value || null,
    };

    // Pass user data to the route handler
    done(null, googleUser);
  }
}
