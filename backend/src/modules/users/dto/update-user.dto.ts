import { ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateUserDto, UserStatus } from './create-user.dto';

/**
 * DTO for updating a user
 * All fields are optional, password and email are excluded (use separate endpoints)
 */
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'email', 'username'] as const),
) {
  @ApiPropertyOptional({
    example: 'ACTIVE',
    description: 'User status',
    enum: UserStatus,
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: 'Invalid status' })
  status?: UserStatus;

  @ApiPropertyOptional({
    example: 'profile-new.jpg',
    description: 'Profile picture filename',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Profile picture must be a string' })
  @MaxLength(500, { message: 'Profile picture path must not exceed 500 characters' })
  profilePic?: string;
}
