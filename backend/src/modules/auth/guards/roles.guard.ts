import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

/**
 * Roles Guard
 *
 * @description Restricts route access based on user roles.
 * Must be used after JwtAuthGuard (user must be authenticated first).
 *
 * ## Usage:
 *
 * ### Require specific role:
 * ```typescript
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('ADMIN')
 * @Get('admin-only')
 * adminOnly() {}
 * ```
 *
 * ### Require multiple roles (OR logic):
 * ```typescript
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('ADMIN', 'PRESIDENT')
 * @Get('leadership')
 * leadershipOnly() {}
 * ```
 *
 * ### Controller-level roles:
 * ```typescript
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('ADMIN')
 * @Controller('admin')
 * export class AdminController {}
 * ```
 *
 * ## Error Responses:
 * - 401 Unauthorized: User role not in allowed roles
 *
 * @see Roles - Decorator to specify required roles
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const hasRole = requiredRoles.some(role => user.role === role);

    if (!hasRole) {
      throw new UnauthorizedException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
