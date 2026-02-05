import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * User role enum - must match Prisma schema
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  PRESIDENT = 'PRESIDENT',
  VICE_PRESIDENT = 'VICE_PRESIDENT',
  DIRECTOR = 'DIRECTOR',
  OFFICE_HEAD = 'OFFICE_HEAD',
}

/**
 * User status enum - must match Prisma schema
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

/**
 * Campus enum - must match Prisma schema
 * TALISAY is the main campus
 */
export enum Campus {
  TALISAY = 'TALISAY',
  BINALBAGAN = 'BINALBAGAN',
  FORTUNE_TOWN = 'FORTUNE_TOWN',
  ALIJIS = 'ALIJIS',
}

/**
 * DTO for creating a new user
 */
export class CreateUserDto {
  @ApiProperty({
    example: 'john.doe@university.edu',
    description: 'User email address (must be unique, will be lowercased)',
    maxLength: 255,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Username (must be unique, will be lowercased)',
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(100, { message: 'Username must not exceed 100 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username can only contain letters, numbers, underscores, and hyphens',
  })
  username: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(100, { message: 'First name must not exceed 100 characters' })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
  lastName: string;

  @ApiProperty({
    example: 'SecureP@ss1',
    description: 'User password (8-35 characters)',
    minLength: 8,
    maxLength: 35,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(35, { message: 'Password must not exceed 35 characters' })
  password: string;

  @ApiProperty({
    example: 'TALISAY',
    description: 'Campus location',
    enum: Campus,
    enumName: 'Campus',
  })
  @IsEnum(Campus, {
    message: 'Invalid campus. Must be one of: TALISAY, BINALBAGAN, FORTUNE_TOWN, ALIJIS',
  })
  @IsNotEmpty({ message: 'Campus is required' })
  campus: Campus;

  @ApiPropertyOptional({
    example: 'Computer Science',
    description: 'Department name',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Department must be a string' })
  @MaxLength(100, { message: 'Department must not exceed 100 characters' })
  department?: string;

  @ApiPropertyOptional({
    example: 'DEPT-001',
    description: 'Department ID',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Department ID must be a string' })
  @MaxLength(50, { message: 'Department ID must not exceed 50 characters' })
  departmentId?: string;

  @ApiPropertyOptional({
    example: 'OFFICE_HEAD',
    description: 'User role',
    enum: UserRole,
    default: UserRole.OFFICE_HEAD,
  })
  @IsOptional()
  @IsEnum(UserRole, {
    message:
      'Invalid role. Must be one of: ADMIN, PRESIDENT, VICE_PRESIDENT, DIRECTOR, OFFICE_HEAD',
  })
  role?: UserRole;

  @ApiPropertyOptional({
    example: 'VP-001',
    description: 'Vice President ID (for hierarchy)',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Vice President ID must be a string' })
  @MaxLength(50, { message: 'Vice President ID must not exceed 50 characters' })
  vicePresidentId?: string;

  @ApiPropertyOptional({
    example: 'Dr. Jane Smith',
    description: 'Vice President name',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Vice President name must be a string' })
  @MaxLength(200, { message: 'Vice President name must not exceed 200 characters' })
  vicePresidentName?: string;

  @ApiPropertyOptional({
    example: 'DIR-001',
    description: 'Director ID (for hierarchy)',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Director ID must be a string' })
  @MaxLength(50, { message: 'Director ID must not exceed 50 characters' })
  directorId?: string;

  @ApiPropertyOptional({
    example: 'Dr. John Doe',
    description: 'Director name',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Director name must be a string' })
  @MaxLength(200, { message: 'Director name must not exceed 200 characters' })
  directorName?: string;

  @ApiPropertyOptional({
    example: 'OH-001',
    description: 'Office Head ID (for hierarchy)',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Office Head ID must be a string' })
  @MaxLength(50, { message: 'Office Head ID must not exceed 50 characters' })
  officeHeadId?: string;

  @ApiPropertyOptional({
    example: 'Mr. Bob Wilson',
    description: 'Office Head name',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Office Head name must be a string' })
  @MaxLength(200, { message: 'Office Head name must not exceed 200 characters' })
  officeHeadName?: string;

  @ApiPropertyOptional({
    example: 'profile.jpg',
    description: 'Profile picture filename',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Profile picture must be a string' })
  @MaxLength(500, { message: 'Profile picture path must not exceed 500 characters' })
  profilePic?: string;
}
