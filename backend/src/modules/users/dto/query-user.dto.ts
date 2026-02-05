import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@/common/utils/pagination.util';
import { UserRole, UserStatus, Campus } from './create-user.dto';

/**
 * Sort options for users
 */
export enum UserSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  EMAIL = 'email',
  USERNAME = 'username',
  FIRST_NAME = 'firstName',
  LAST_NAME = 'lastName',
}

/**
 * Sort order
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * DTO for querying users with filters
 */
export class QueryUserDto extends PaginationDto {
  @ApiPropertyOptional({
    // example: 'john',
    description: 'Search by name, email, or username',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    // example: 'OFFICE_HEAD',
    description: 'Filter by role',
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    // example: 'ACTIVE',
    description: 'Filter by status',
    enum: UserStatus,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Filter by campus',
    enum: Campus,
    enumName: 'Campus',
  })
  @IsOptional()
  @IsEnum(Campus)
  campus?: Campus;

  @ApiPropertyOptional({
    // example: 'Computer Science',
    description: 'Filter by department',
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    // example: 'DIR-001',
    description: 'Filter by director ID',
  })
  @IsOptional()
  @IsString()
  directorId?: string;

  @ApiPropertyOptional({
    // example: 'VP-001',
    description: 'Filter by vice president ID',
  })
  @IsOptional()
  @IsString()
  vicePresidentId?: string;

  @ApiPropertyOptional({
    // example: 'DEPT-001',
    description: 'Filter by department ID',
  })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({
    example: 'createdAt',
    description: 'Sort by field',
    enum: UserSortBy,
    default: UserSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(UserSortBy)
  sortBy?: UserSortBy = UserSortBy.CREATED_AT;

  @ApiPropertyOptional({
    example: 'desc',
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
