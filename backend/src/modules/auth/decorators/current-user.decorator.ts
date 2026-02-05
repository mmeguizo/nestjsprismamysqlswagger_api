import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Current User Decorator
 *
 * @description Extracts the current authenticated user from the request.
 * The user is attached to the request by JwtAuthGuard after token validation.
 *
 * ## Usage:
 *
 * ### Get full user object:
 * ```typescript
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 * ```
 *
 * ### Get specific user property:
 * ```typescript
 * @Get('my-id')
 * getMyId(@CurrentUser('id') userId: number) {
 *   return { userId };
 * }
 *
 * @Get('my-role')
 * getMyRole(@CurrentUser('role') role: string) {
 *   return { role };
 * }
 * ```
 *
 * ## User Object Structure:
 * ```typescript
 * {
 *   id: number;
 *   email: string;
 *   username: string;
 *   firstName: string;
 *   lastName: string;
 *   role: UserRole;
 *   status: UserStatus;
 *   campus: string;
 *   department?: string;
 *   profilePic?: string;
 * }
 * ```
 *
 * @param data - Optional property name to extract
 * @see JwtAuthGuard - Guard that attaches user to request
 */
export const CurrentUser = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;

  // If specific property requested, return just that property
  if (data) {
    return user?.[data];
  }

  // Otherwise return full user object
  return user;
});
