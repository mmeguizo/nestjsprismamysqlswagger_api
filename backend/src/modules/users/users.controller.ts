import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto, UserResponseDto } from './dto';
import { ParseIntIdPipe } from '@/common/pipes';
import { successResponse, paginatedResponse } from '@/common/utils/response.util';

/**
 * Users Controller
 *
 * @description Handles all user management operations.
 * All endpoints require JWT authentication.
 *
 * ## Authentication
 * All endpoints require a valid JWT access token in the Authorization header:
 * ```
 * Authorization: Bearer <access_token>
 * ```
 *
 * ## Endpoints
 * - POST /users - Create new user
 * - GET /users - List all users (paginated)
 * - GET /users/stats - Get user statistics
 * - GET /users/:id - Get single user
 * - PATCH /users/:id - Update user
 * - DELETE /users/:id - Soft delete user
 * - PATCH /users/:id/restore - Restore deleted user
 */
@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a new user
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new user',
    description: `
Creates a new user account with the provided information.

**Required Fields:**
- email: Valid email address (must be unique)
- username: 3-100 characters, alphanumeric and underscores only
- firstName, lastName: User's name
- password: 8-35 characters
- campus: Campus name

**Optional Fields:**
- department, departmentId
- role: ADMIN, PRESIDENT, VICE_PRESIDENT, DIRECTOR, OFFICE_HEAD
- status: ACTIVE, PENDING, INACTIVE
- Hierarchy fields (vicePresidentId, directorId, etc.)
    `,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'Email or username already exists' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return successResponse(user, 'User created successfully');
  }

  /**
   * Get all users with pagination and filters
   */
  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: `
Retrieves a paginated list of users with optional filters.

**Pagination:**
- page: Page number (default: 1)
- limit: Items per page (default: 10, max: 100)

**Filters:**
- search: Search in email, username, firstName, lastName
- role: Filter by user role
- status: Filter by user status
- campus: Filter by campus
- department: Filter by department
- deleted: Include deleted users (default: false)

**Sorting:**
- sortBy: Field to sort by (default: createdAt)
- sortOrder: ASC or DESC (default: DESC)
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users retrieved successfully',
  })
  async findAll(@Query() query: QueryUserDto) {
    const result = await this.usersService.findAll(query);
    return paginatedResponse(result.data, result.total, result.page, result.limit);
  }

  /**
   * Get user statistics
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get user statistics',
    description: `
Returns user count statistics grouped by:
- Total users
- By role (ADMIN, PRESIDENT, etc.)
- By status (ACTIVE, PENDING, INACTIVE)
- By campus
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
  })
  async getStats() {
    const stats = await this.usersService.getStats();
    return successResponse(stats, 'Statistics retrieved successfully');
  }

  /**
   * Get a single user by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a single user by their ID. Returns 404 if not found.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async findOne(@Param('id', ParseIntIdPipe) id: number) {
    const user = await this.usersService.findOne(id);
    return successResponse(user, 'User retrieved successfully');
  }

  /**
   * Update a user
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates an existing user with the provided information',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConflictResponse({ description: 'Student ID or Faculty ID already exists' })
  async update(@Param('id', ParseIntIdPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    return successResponse(user, 'User updated successfully');
  }

  /**
   * Soft delete a user
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Soft deletes a user (can be restored later)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async remove(@Param('id', ParseIntIdPipe) id: number) {
    const user = await this.usersService.remove(id);
    return successResponse(user, 'User deleted successfully');
  }

  /**
   * Restore a soft-deleted user
   */
  @Patch(':id/restore')
  @ApiOperation({
    summary: 'Restore deleted user',
    description: 'Restores a previously soft-deleted user',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User restored successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConflictResponse({ description: 'User is not deleted' })
  async restore(@Param('id', ParseIntIdPipe) id: number) {
    const user = await this.usersService.restore(id);
    return successResponse(user, 'User restored successfully');
  }
}
