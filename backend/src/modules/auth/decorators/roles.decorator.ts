import { SetMetadata } from '@nestjs/common';

/**
 * Roles Decorator
 *
 * @description Specifies which roles can access a route.
 * Must be used with RolesGuard.
 *
 * ## Usage:
 *
 * ### Single role:
 * ```typescript
 * @Roles('ADMIN')
 * @Get('admin')
 * adminOnly() {}
 * ```
 *
 * ### Multiple roles (OR logic):
 * ```typescript
 * @Roles('ADMIN', 'PRESIDENT', 'VICE_PRESIDENT')
 * @Get('leadership')
 * leadershipOnly() {}
 * ```
 *
 * ## Available Roles (from Prisma schema):
 * - ADMIN: System administrator
 * - PRESIDENT: University president
 * - VICE_PRESIDENT: Vice president
 * - DIRECTOR: Department director
 * - OFFICE_HEAD: Office head
 *
 * @param roles - List of allowed roles
 * @see RolesGuard - Guard that enforces role requirements
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
