import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard API Response wrapper
 */
export class ApiResponse<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data: T;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiProperty({ example: '2026-02-04T10:00:00.000Z' })
  timestamp: string;

  constructor(success: boolean, data: T, message: string) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Pagination metadata
 */
export class PaginationMeta {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPreviousPage: boolean;

  constructor(total: number, page: number, limit: number) {
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNextPage = page < this.totalPages;
    this.hasPreviousPage = page > 1;
  }
}

/**
 * Paginated response wrapper
 */
export class PaginatedResponse<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data: T[];

  @ApiProperty()
  meta: PaginationMeta;

  @ApiProperty({ example: '2026-02-04T10:00:00.000Z' })
  timestamp: string;

  constructor(data: T[], meta: PaginationMeta) {
    this.success = true;
    this.data = data;
    this.meta = meta;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Helper function to create success response
 */
export function successResponse<T>(data: T, message = 'Operation successful'): ApiResponse<T> {
  return new ApiResponse<T>(true, data, message);
}

/**
 * Helper function to create paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const meta = new PaginationMeta(total, page, limit);
  return new PaginatedResponse<T>(data, meta);
}

/**
 * Error response class
 */
export class ErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty()
  error: {
    statusCode: number;
    message: string;
    details?: unknown;
  };

  @ApiProperty({ example: '2026-02-04T10:00:00.000Z' })
  timestamp: string;

  constructor(statusCode: number, message: string, details?: unknown) {
    this.success = false;
    this.error = { statusCode, message, details };
    this.timestamp = new Date().toISOString();
  }
}
