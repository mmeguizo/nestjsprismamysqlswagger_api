import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

// Constants
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

/**
 * Pagination query DTO
 */
export class PaginationDto {
  @ApiPropertyOptional({
    minimum: 1,
    default: DEFAULT_PAGE,
    description: 'Page number',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = DEFAULT_PAGE;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: MAX_PAGE_SIZE,
    default: DEFAULT_PAGE_SIZE,
    description: 'Number of items per page',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  @IsOptional()
  limit?: number = DEFAULT_PAGE_SIZE;
}

/**
 * Calculate pagination offset
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Create pagination params for Prisma
 */
export function getPaginationParams(dto: PaginationDto): { skip: number; take: number } {
  const page = dto.page ?? DEFAULT_PAGE;
  const limit = dto.limit ?? DEFAULT_PAGE_SIZE;

  return {
    skip: calculateSkip(page, limit),
    take: limit,
  };
}

/**
 * Pagination result interface
 */
export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
