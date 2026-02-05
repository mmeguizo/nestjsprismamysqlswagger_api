import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '@/prisma';
import { CreateUserDto, UpdateUserDto, QueryUserDto, UserSortBy, SortOrder } from './dto';
import {
  getPaginationParams,
  PaginationResult,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/common/utils/pagination.util';
import { excludeFields } from '@/common/utils/transform.util';
import * as bcrypt from 'bcryptjs';

/**
 * User without password
 */
export type SafeUser = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    // Lowercase email and username
    const email = createUserDto.email.toLowerCase();
    const username = createUserDto.username.toLowerCase();

    // Check if email already exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check if username already exists
    const existingUsername = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        email,
        username,
        password: hashedPassword,
      },
    });

    this.logger.log(`User created: ${user.email} (ID: ${user.id})`);

    return this.excludePassword(user);
  }

  /**
   * Find all users with pagination and filters
   */
  async findAll(query: QueryUserDto): Promise<PaginationResult<SafeUser>> {
    const {
      search,
      role,
      status,
      campus,
      department,
      directorId,
      vicePresidentId,
      departmentId,
      sortBy,
      sortOrder,
    } = query;
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_PAGE_SIZE;
    const { skip, take } = getPaginationParams({ page, limit });

    // Build where clause
    const where: Prisma.UserWhereInput = {
      deleted: false, // Exclude soft-deleted users
      ...(role && { role }),
      ...(status && { status }),
      ...(campus && { campus }),
      ...(department && { department: { contains: department } }),
      ...(directorId && { directorId }),
      ...(vicePresidentId && { vicePresidentId }),
      ...(departmentId && { departmentId }),
      ...(search && {
        OR: [
          { email: { contains: search } },
          { username: { contains: search } },
          { firstName: { contains: search } },
          { lastName: { contains: search } },
        ],
      }),
    };

    // Build orderBy
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [sortBy ?? UserSortBy.CREATED_AT]: sortOrder ?? SortOrder.DESC,
    };

    // Execute queries in parallel
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(user => this.excludePassword(user)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find one user by ID
   */
  async findOne(id: number): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.deleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.excludePassword(user);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) return null;

    return this.excludePassword(user);
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (!user) return null;

    return this.excludePassword(user);
  }

  /**
   * Update a user
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<SafeUser> {
    // Check if user exists
    await this.findOne(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    this.logger.log(`User updated: ${user.email} (ID: ${user.id})`);

    return this.excludePassword(user);
  }

  /**
   * Soft delete a user
   */
  async remove(id: number): Promise<SafeUser> {
    // Check if user exists
    await this.findOne(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        deleted: true,
        status: 'DELETED',
      },
    });

    this.logger.log(`User soft-deleted: ${user.email} (ID: ${user.id})`);

    return this.excludePassword(user);
  }

  /**
   * Hard delete a user (permanent)
   * Use with caution - mainly for testing
   */
  async hardDelete(id: number): Promise<SafeUser> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    this.logger.warn(`User permanently deleted: ${user.email} (ID: ${user.id})`);

    return this.excludePassword(user);
  }

  /**
   * Restore a soft-deleted user
   */
  async restore(id: number): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (!user.deleted) {
      throw new ConflictException('User is not deleted');
    }

    const restoredUser = await this.prisma.user.update({
      where: { id },
      data: {
        deleted: false,
        status: 'ACTIVE',
      },
    });

    this.logger.log(`User restored: ${restoredUser.email} (ID: ${restoredUser.id})`);

    return this.excludePassword(restoredUser);
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: number): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Validate user password (for authentication)
   */
  async validatePassword(email: string, password: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || user.deleted) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    return this.excludePassword(user);
  }

  /**
   * Get user statistics
   */
  async getStats(): Promise<{
    total: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
    byCampus: Record<string, number>;
  }> {
    const [total, roleStats, statusStats, campusStats] = await Promise.all([
      this.prisma.user.count({ where: { deleted: false } }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
        where: { deleted: false },
      }),
      this.prisma.user.groupBy({
        by: ['status'],
        _count: { status: true },
        where: { deleted: false },
      }),
      this.prisma.user.groupBy({
        by: ['campus'],
        _count: { campus: true },
        where: { deleted: false },
      }),
    ]);

    const byRole = roleStats.reduce(
      (acc, item) => {
        acc[item.role] = item._count.role;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byStatus = statusStats.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byCampus = campusStats.reduce(
      (acc, item) => {
        acc[item.campus] = item._count.campus;
        return acc;
      },
      {} as Record<string, number>,
    );

    return { total, byRole, byStatus, byCampus };
  }

  /**
   * Helper to exclude password from user object
   */
  private excludePassword(user: User): SafeUser {
    return excludeFields(user, ['password']);
  }
}
