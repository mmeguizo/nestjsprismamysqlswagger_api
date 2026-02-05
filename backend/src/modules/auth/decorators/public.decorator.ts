import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for public routes
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Public Route Decorator
 *
 * @description Marks a route as public, bypassing JWT authentication.
 * Use this for routes that should be accessible without authentication.
 *
 * ## Usage:
 * ```typescript
 * @Public()
 * @Get('health')
 * healthCheck() {
 *   return { status: 'ok' };
 * }
 * ```
 *
 * ## Important Notes:
 * - Only works when JwtAuthGuard checks for this decorator
 * - Should be used sparingly for security reasons
 * - Common use cases: health checks, login, register, public info
 *
 * @see JwtAuthGuard - Guard that respects this decorator
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
