import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy, RefreshTokenStrategy, GoogleStrategy } from './strategies';
import { JwtAuthGuard, RefreshTokenGuard, GoogleAuthGuard, RolesGuard } from './guards';
import { PrismaModule } from '@/prisma/prisma.module';

/**
 * Authentication Module
 *
 * @description Provides authentication and authorization functionality.
 *
 * ## Features:
 * - JWT-based authentication (access + refresh tokens)
 * - Google OAuth 2.0 integration
 * - Role-based access control (RBAC)
 *
 * ## Strategies:
 * - JwtStrategy: Validates access tokens
 * - RefreshTokenStrategy: Validates refresh tokens
 * - GoogleStrategy: Handles Google OAuth flow
 *
 * ## Guards:
 * - JwtAuthGuard: Protects routes requiring authentication
 * - RefreshTokenGuard: Protects token refresh endpoint
 * - GoogleAuthGuard: Initiates/handles Google OAuth
 * - RolesGuard: Restricts access by user role
 *
 * ## Decorators:
 * - @Public(): Skip authentication for a route
 * - @Roles(): Specify required roles for a route
 * - @CurrentUser(): Extract current user from request
 *
 * ## Configuration (Environment Variables):
 * - JWT_SECRET: Secret for signing access tokens
 * - JWT_ACCESS_EXPIRATION: Access token lifetime (e.g., '15m')
 * - JWT_REFRESH_SECRET: Secret for signing refresh tokens
 * - JWT_REFRESH_EXPIRATION: Refresh token lifetime (e.g., '7d')
 * - GOOGLE_CLIENT_ID: Google OAuth client ID
 * - GOOGLE_CLIENT_SECRET: Google OAuth client secret
 * - GOOGLE_CALLBACK_URL: OAuth callback URL
 */
@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // Strategies
    JwtStrategy,
    RefreshTokenStrategy,
    GoogleStrategy,
    // Guards
    JwtAuthGuard,
    RefreshTokenGuard,
    GoogleAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
