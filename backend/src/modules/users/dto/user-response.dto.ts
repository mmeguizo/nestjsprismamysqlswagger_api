import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { UserRole, UserStatus, Campus } from './create-user.dto';

/**
 * User response DTO - excludes sensitive data like password
 */
@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ example: 'john.doe@university.edu' })
  email: string;

  @Expose()
  @ApiProperty({ example: 'johndoe' })
  username: string;

  @Expose()
  @ApiProperty({ example: 'John' })
  firstName: string;

  @Expose()
  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @Expose()
  @ApiProperty({ example: 'TALISAY', enum: Campus })
  campus: Campus;

  @Expose()
  @ApiPropertyOptional({ example: 'Computer Science' })
  department?: string;

  @Expose()
  @ApiPropertyOptional({ example: 'DEPT-001' })
  departmentId?: string;

  @Expose()
  @ApiProperty({ example: 'OFFICE_HEAD', enum: UserRole })
  role: UserRole;

  @Expose()
  @ApiProperty({ example: 'PENDING', enum: UserStatus })
  status: UserStatus;

  @Expose()
  @ApiPropertyOptional({ example: 'VP-001' })
  vicePresidentId?: string;

  @Expose()
  @ApiPropertyOptional({ example: 'Dr. Jane Smith' })
  vicePresidentName?: string;

  @Expose()
  @ApiPropertyOptional({ example: 'DIR-001' })
  directorId?: string;

  @Expose()
  @ApiPropertyOptional({ example: 'Dr. John Doe' })
  directorName?: string;

  @Expose()
  @ApiPropertyOptional({ example: 'OH-001' })
  officeHeadId?: string;

  @Expose()
  @ApiPropertyOptional({ example: 'Mr. Bob Wilson' })
  officeHeadName?: string;

  @Expose()
  @ApiProperty({ example: 'no-photo.png' })
  profilePic: string;

  @Expose()
  @ApiProperty({ example: false })
  deleted: boolean;

  @Expose()
  @ApiProperty({ example: '2026-02-04T10:00:00.000Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2026-02-04T10:00:00.000Z' })
  updatedAt: Date;

  @Expose()
  @ApiPropertyOptional({ example: '2026-02-04T10:00:00.000Z' })
  lastLoginAt?: Date;

  // Password is excluded automatically due to @Exclude() on class
  password?: string;

  /**
   * Helper to get full name
   */
  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
