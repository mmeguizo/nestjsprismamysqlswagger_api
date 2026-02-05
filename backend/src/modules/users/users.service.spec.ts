import { Test, TestingModule } from '@nestjs/testing';
import { UsersService, SafeUser } from './users.service';
import { PrismaService } from '@/prisma';
import { CreateUserDto, UserRole, UserStatus } from './dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  // Mock user data
  const mockUser = {
    id: 1,
    email: 'test@university.edu',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedpassword123',
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
    studentId: 'STU-2024-001',
    facultyId: null,
    department: 'Computer Science',
    phoneNumber: '+1234567890',
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
    deletedAt: null,
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@university.edu',
        firstName: 'John',
        lastName: 'Doe',
        password: 'SecureP@ss123',
        role: UserRole.STUDENT,
        studentId: 'STU-2024-001',
        department: 'Computer Science',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result.email).toBe(mockUser.email);
      expect(result).not.toHaveProperty('password');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@university.edu',
        firstName: 'John',
        lastName: 'Doe',
        password: 'SecureP@ss123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if studentId already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@university.edu',
        firstName: 'Jane',
        lastName: 'Doe',
        password: 'SecureP@ss123',
        studentId: 'STU-2024-001', // Already exists
      };

      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce(mockUser); // studentId check

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const query = { page: 1, limit: 10 };

      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.data[0]).not.toHaveProperty('password');
    });

    it('should filter by role', async () => {
      const query = { page: 1, limit: 10, role: UserRole.FACULTY };

      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            role: UserRole.FACULTY,
          }),
        }),
      );
    });

    it('should search by name or email', async () => {
      const query = { page: 1, limit: 10, search: 'john' };

      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);
      mockPrismaService.user.count.mockResolvedValue(1);

      await service.findAll(query);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { email: { contains: 'john' } },
              { firstName: { contains: 'john' } },
            ]),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user is soft-deleted', async () => {
      const deletedUser = { ...mockUser, deletedAt: new Date() };
      mockPrismaService.user.findUnique.mockResolvedValue(deletedUser);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateData = { firstName: 'Jane' };
      const updatedUser = { ...mockUser, firstName: 'Jane' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateData);

      expect(result.firstName).toBe('Jane');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      const deletedUser = {
        ...mockUser,
        status: UserStatus.DELETED,
        deletedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(deletedUser);

      const result = await service.remove(1);

      expect(result.status).toBe(UserStatus.DELETED);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: 'DELETED',
          deletedAt: expect.any(Date),
        }),
      });
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted user', async () => {
      const deletedUser = {
        ...mockUser,
        status: UserStatus.DELETED,
        deletedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(deletedUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.restore(1);

      expect(result.status).toBe(UserStatus.ACTIVE);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: null, status: 'ACTIVE' },
      });
    });

    it('should throw ConflictException if user is not deleted', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.restore(1)).rejects.toThrow(ConflictException);
    });
  });

  describe('getStats', () => {
    it('should return user statistics', async () => {
      mockPrismaService.user.count.mockResolvedValue(100);
      mockPrismaService.user.groupBy
        .mockResolvedValueOnce([
          { role: 'STUDENT', _count: { role: 80 } },
          { role: 'FACULTY', _count: { role: 15 } },
          { role: 'ADMIN', _count: { role: 5 } },
        ])
        .mockResolvedValueOnce([
          { status: 'ACTIVE', _count: { status: 95 } },
          { status: 'INACTIVE', _count: { status: 5 } },
        ]);

      const result = await service.getStats();

      expect(result.total).toBe(100);
      expect(result.byRole).toEqual({ STUDENT: 80, FACULTY: 15, ADMIN: 5 });
      expect(result.byStatus).toEqual({ ACTIVE: 95, INACTIVE: 5 });
    });
  });
});
