import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JWT Authentication Guard
 *
 * @description Protects routes by validating JWT access tokens.
 * Uses the 'jwt' strategy defined in JwtStrategy.
 *
 * ## Usage:
 *
 * ### Protect a single route:
 * ```typescript
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@Request() req) {
 *   return req.user;
 * }
 * ```
 *
 * ### Protect entire controller:
 * ```typescript
 * @UseGuards(JwtAuthGuard)
 * @Controller('users')
 * export class UsersController {}
 * ```
 *
 * ### Apply globally (in main.ts or module):
 * ```typescript
 * app.useGlobalGuards(new JwtAuthGuard());
 * // OR
 * providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }]
 * ```
 *
 * ### Skip authentication for specific routes:
 * ```typescript
 * @Public() // Custom decorator
 * @Get('health')
 * healthCheck() {}
 * ```
 *
 * ## Error Responses:
 * - 401 Unauthorized: Missing, invalid, or expired token
 *
 * @see JwtStrategy - Strategy that validates the token
 * @see Public - Decorator to skip authentication
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Determine if the route should be activated
   *
   * @description Checks for @Public() decorator to skip authentication.
   * If public, allows access without token validation.
   *
   * @param context - Execution context
   * @returns Boolean or Promise/Observable resolving to boolean
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Otherwise, validate JWT token
    return super.canActivate(context);
  }
}
