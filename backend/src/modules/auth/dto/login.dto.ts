import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO for email/password login
 *
 * @description Used for traditional login with email and password.
 * Password must be at least 8 characters.
 *
 * @example
 * {
 *   "email": "admin@university.edu",
 *   "password": "Admin@123"
 * }
 */
export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@university.edu',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password (min 8 characters)',
    example: 'Admin@123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}
