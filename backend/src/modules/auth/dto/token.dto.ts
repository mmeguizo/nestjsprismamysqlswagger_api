import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus, Campus } from '@prisma/client';

/**
 * DTO for JWT token response
 *
 * @description Contains access token, refresh token, and expiration info.
 * The access token is short-lived (15 minutes by default).
 * The refresh token is long-lived (7 days by default) and used to get new access tokens.
 *
 * @example
 * {
 *   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "expiresIn": 900,
 *   "tokenType": "Bearer"
 * }
 */
export class TokenResponseDto {
  @ApiProperty({
    description: 'JWT access token for API authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token for obtaining new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Access token expiration time in seconds',
    example: 900,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Token type (always Bearer)',
    example: 'Bearer',
  })
  tokenType: string;
}

/**
 * DTO for authenticated user info in responses
 *
 * @description Contains user information returned after successful authentication.
 * Password is never included in responses.
 */
export class AuthUserDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User email', example: 'admin@university.edu' })
  email: string;

  @ApiProperty({ description: 'Username', example: 'admin' })
  username: string;

  @ApiProperty({ description: 'First name', example: 'System' })
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Administrator' })
  lastName: string;

  @ApiProperty({ description: 'User role', enum: UserRole, example: UserRole.ADMIN })
  role: UserRole;

  @ApiProperty({ description: 'User status', enum: UserStatus, example: UserStatus.ACTIVE })
  status: UserStatus;

  @ApiProperty({ description: 'Campus', enum: Campus, example: Campus.TALISAY })
  campus: Campus;

  @ApiProperty({ description: 'Department', example: 'IT Department', nullable: true })
  department?: string;

  @ApiProperty({ description: 'Profile picture URL', example: 'no-photo.png', nullable: true })
  profilePic?: string;
}

/**
 * DTO for login response
 *
 * @description Complete response after successful login containing both
 * token information and user details.
 */
export class LoginResponseDto {
  @ApiProperty({ description: 'Token information' })
  tokens: TokenResponseDto;

  @ApiProperty({ description: 'Authenticated user information' })
  user: AuthUserDto;
}

/**
 * DTO for refresh token request
 *
 * @description Used to obtain a new access token using a valid refresh token.
 *
 * @example
 * {
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 */
export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token obtained from login',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}

/**
 * DTO for Google OAuth user data
 *
 * @description Data received from Google after successful OAuth authentication.
 * This is used internally to create or update user records.
 */
export class GoogleUserDto {
  @ApiProperty({ description: 'Google user ID' })
  googleId: string;

  @ApiProperty({ description: 'User email from Google' })
  email: string;

  @ApiProperty({ description: 'First name from Google' })
  firstName: string;

  @ApiProperty({ description: 'Last name from Google' })
  lastName: string;

  @ApiProperty({ description: 'Profile picture URL from Google', nullable: true })
  picture?: string;
}
