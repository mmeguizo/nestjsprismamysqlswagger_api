import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, LoginResponseDto, TokenResponseDto } from './dto';
import { GoogleAuthGuard, JwtAuthGuard, RefreshTokenGuard } from './guards';
import { Public, CurrentUser } from './decorators';

/**
 * Authentication Controller
 *
 * @description Handles all authentication endpoints including:
 * - Email/password login
 * - Google OAuth login
 * - Token refresh
 * - User profile
 *
 * ## Authentication Flow:
 *
 * ### Option 1: Email/Password Login
 * ```
 * POST /api/v1/auth/login
 * Body: { "email": "user@example.com", "password": "password123" }
 * Response: { tokens: { accessToken, refreshToken }, user: {...} }
 * ```
 *
 * ### Option 2: Google OAuth Login
 * ```
 * 1. Frontend redirects to: GET /api/v1/auth/google
 * 2. User authenticates with Google
 * 3. Google redirects to: GET /api/v1/auth/google/callback
 * 4. Backend redirects to frontend with tokens in URL
 * ```
 *
 * ### Refreshing Tokens
 * ```
 * POST /api/v1/auth/refresh
 * Body: { "refreshToken": "..." }
 * Response: { accessToken, refreshToken, expiresIn, tokenType }
 * ```
 *
 * ### Accessing Protected Routes
 * ```
 * GET /api/v1/users
 * Headers: { "Authorization": "Bearer <accessToken>" }
 * ```
 *
 * ## Token Lifecycle:
 * - Access Token: 15 minutes (configurable via JWT_ACCESS_EXPIRATION)
 * - Refresh Token: 7 days (configurable via JWT_REFRESH_EXPIRATION)
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  /**
   * Login with email and password
   *
   * @description Authenticates user with email and password credentials.
   * Returns JWT access token and refresh token on success.
   *
   * ## Request:
   * ```json
   * {
   *   "email": "admin@university.edu",
   *   "password": "Admin@123"
   * }
   * ```
   *
   * ## Response (200 OK):
   * ```json
   * {
   *   "success": true,
   *   "message": "Login successful",
   *   "data": {
   *     "tokens": {
   *       "accessToken": "eyJhbGciOiJIUzI1NiIs...",
   *       "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
   *       "expiresIn": 900,
   *       "tokenType": "Bearer"
   *     },
   *     "user": {
   *       "id": 1,
   *       "email": "admin@university.edu",
   *       "firstName": "System",
   *       "lastName": "Administrator",
   *       "role": "ADMIN",
   *       "status": "ACTIVE"
   *     }
   *   }
   * }
   * ```
   *
   * ## Errors:
   * - 401 Unauthorized: Invalid email or password
   * - 401 Unauthorized: Account not active
   * - 400 Bad Request: Validation failed
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with email and password',
    description: `
Authenticates a user using email and password credentials.

**Returns:**
- JWT access token (15 min expiry)
- JWT refresh token (7 day expiry)
- User profile information

**Usage:**
1. Send login credentials
2. Store tokens securely (localStorage, httpOnly cookies)
3. Use access token in Authorization header for API calls
4. Use refresh token to get new access token before expiry
    `,
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or inactive account',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
  })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      message: 'Login successful',
      data: result,
    };
  }

  /**
   * Initiate Google OAuth login
   *
   * @description Redirects user to Google login page.
   * After authentication, Google redirects back to the callback URL.
   *
   * ## Flow:
   * 1. Frontend opens this URL (popup or redirect)
   * 2. User sees Google login/consent screen
   * 3. After login, redirected to /auth/google/callback
   *
   * ## Frontend Implementation (Popup):
   * ```javascript
   * const popup = window.open(
   *   'http://localhost:3000/api/v1/auth/google',
   *   'Google Login',
   *   'width=500,height=600'
   * );
   *
   * window.addEventListener('message', (event) => {
   *   if (event.data.type === 'AUTH_SUCCESS') {
   *     const { tokens, user } = event.data;
   *     // Store tokens and update state
   *   }
   * });
   * ```
   */
  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Initiate Google OAuth login',
    description: `
Redirects user to Google for authentication.

**Flow:**
1. User clicks "Login with Google" on frontend
2. Frontend redirects/opens popup to this endpoint
3. User authenticates with Google
4. Google redirects back to /auth/google/callback
5. Backend creates/updates user and generates tokens
6. User redirected to frontend with tokens

**Note:** This endpoint performs a redirect, not a JSON response.
    `,
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google login page',
  })
  googleAuth() {
    // Guard handles the redirect to Google
    // This method body is not executed
  }

  /**
   * Google OAuth callback
   *
   * @description Handles the callback from Google after user authentication.
   * Creates/updates user and redirects to frontend with tokens.
   *
   * ## Success Redirect:
   * ```
   * {FRONTEND_URL}/auth/callback?
   *   accessToken=...&
   *   refreshToken=...&
   *   expiresIn=900
   * ```
   *
   * ## Error Redirect:
   * ```
   * {FRONTEND_URL}/auth/callback?error=authentication_failed
   * ```
   *
   * ## Frontend Callback Handler:
   * ```javascript
   * // In /auth/callback component
   * const params = new URLSearchParams(window.location.search);
   * const accessToken = params.get('accessToken');
   * const refreshToken = params.get('refreshToken');
   *
   * if (accessToken) {
   *   // Store tokens
   *   localStorage.setItem('accessToken', accessToken);
   *   localStorage.setItem('refreshToken', refreshToken);
   *   // Redirect to dashboard
   * } else {
   *   // Show error
   * }
   * ```
   */
  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Google OAuth callback',
    description: `
Handles the callback from Google after user authentication.

**After successful authentication:**
- Creates new user (if first time) with default role and password
- Updates existing user's profile picture if changed
- Generates JWT tokens
- Redirects to frontend with tokens in URL parameters

**Redirect URL:** \`{FRONTEND_URL}/auth/callback?accessToken=...&refreshToken=...&expiresIn=...\`
    `,
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend with tokens or error',
  })
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    try {
      const result = await this.authService.googleLogin(req.user);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:4200');

      // Redirect to frontend with tokens
      const redirectUrl = new URL(`${frontendUrl}/auth/callback`);
      redirectUrl.searchParams.append('accessToken', result.tokens.accessToken);
      redirectUrl.searchParams.append('refreshToken', result.tokens.refreshToken);
      redirectUrl.searchParams.append('expiresIn', result.tokens.expiresIn.toString());

      res.redirect(redirectUrl.toString());
    } catch (error) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:4200');
      res.redirect(`${frontendUrl}/auth/callback?error=authentication_failed`);
    }
  }

  /**
   * Refresh access token
   *
   * @description Exchange a valid refresh token for a new token pair.
   * Use this before the access token expires to maintain session.
   *
   * ## Request:
   * ```json
   * {
   *   "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
   * }
   * ```
   *
   * ## Response (200 OK):
   * ```json
   * {
   *   "success": true,
   *   "message": "Tokens refreshed successfully",
   *   "data": {
   *     "accessToken": "eyJhbGciOiJIUzI1NiIs...",
   *     "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
   *     "expiresIn": 900,
   *     "tokenType": "Bearer"
   *   }
   * }
   * ```
   *
   * ## Token Rotation:
   * Each refresh generates a new refresh token.
   * The old refresh token is invalidated (stateless implementation).
   *
   * ## When to Refresh:
   * - Before access token expires (check expiresIn)
   * - After receiving 401 Unauthorized response
   * - Proactively every 10-14 minutes
   */
  @Public()
  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: `
Exchange a valid refresh token for a new access token and refresh token pair.

**Token Rotation:**
Each call generates new access AND refresh tokens.
Store the new refresh token and discard the old one.

**When to use:**
- Proactively before access token expires
- After receiving 401 Unauthorized
- Recommended: Refresh when ~2 minutes remaining on access token
    `,
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refresh(@Req() req: any) {
    const tokens = await this.authService.refreshTokens(req.user.id);
    return {
      success: true,
      message: 'Tokens refreshed successfully',
      data: tokens,
    };
  }

  /**
   * Get current user profile
   *
   * @description Returns the profile of the currently authenticated user.
   * Requires valid JWT access token in Authorization header.
   *
   * ## Request:
   * ```
   * GET /api/v1/auth/profile
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   * ```
   *
   * ## Response (200 OK):
   * ```json
   * {
   *   "success": true,
   *   "message": "Profile retrieved successfully",
   *   "data": {
   *     "id": 1,
   *     "email": "admin@university.edu",
   *     "username": "admin",
   *     "firstName": "System",
   *     "lastName": "Administrator",
   *     "role": "ADMIN",
   *     "status": "ACTIVE",
   *     "campus": "Main Campus",
   *     "department": "IT Department",
   *     "profilePic": "no-photo.png",
   *     "createdAt": "2024-01-01T00:00:00.000Z",
   *     "updatedAt": "2024-01-01T00:00:00.000Z"
   *   }
   * }
   * ```
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description: `
Returns the full profile of the currently authenticated user.

**Requires:** Valid JWT access token in Authorization header

**Usage:**
\`\`\`
GET /api/v1/auth/profile
Authorization: Bearer <accessToken>
\`\`\`
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getProfile(@CurrentUser('id') userId: number) {
    const profile = await this.authService.getProfile(userId);
    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: profile,
    };
  }
}
