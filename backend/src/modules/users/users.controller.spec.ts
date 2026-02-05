import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService, SafeUser } from './users.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto, UserRole, UserStatus } from './dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  // Mock user data
  const mockUser: SafeUser = {
    id: 1,
    email: 'test@university.edu',
    firstName: 'John',
    lastName: 'Doe',
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

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(result.message).toBe('User created successfully');
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictException if email exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@university.edu',
        firstName: 'John',
        lastName: 'Doe',
        password: 'SecureP@ss123',
      };

      mockUsersService.create.mockRejectedValue(new ConflictException('Email already exists'));

      await expect(controller.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const query: QueryUserDto = { page: 1, limit: 10 };
      const mockResult = {
        data: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockUsersService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(query);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockUser]);
      expect(result.meta.total).toBe(1);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter by role', async () => {
      const query: QueryUserDto = { page: 1, limit: 10, role: UserRole.FACULTY };
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockUsersService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(query);

      expect(result.data).toEqual([]);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException('User with ID 999 not found'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        department: 'Mathematics',
      };
      const updatedUser = { ...mockUser, ...updateUserDto };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(1, updateUserDto);

      expect(result.success).toBe(true);
      expect(result.data.firstName).toBe('Jane');
      expect(result.message).toBe('User updated successfully');
      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      const deletedUser = {
        ...mockUser,
        status: UserStatus.DELETED,
        deletedAt: new Date(),
      };

      mockUsersService.remove.mockResolvedValue(deletedUser);

      const result = await controller.remove(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('User deleted successfully');
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('restore', () => {
    it('should restore a deleted user', async () => {
      mockUsersService.restore.mockResolvedValue(mockUser);

      const result = await controller.restore(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('User restored successfully');
      expect(service.restore).toHaveBeenCalledWith(1);
    });
  });

  describe('getStats', () => {
    it('should return user statistics', async () => {
      const mockStats = {
        total: 100,
        byRole: { STUDENT: 80, FACULTY: 15, ADMIN: 5 },
        byStatus: { ACTIVE: 95, INACTIVE: 5 },
      };

      mockUsersService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStats);
      expect(service.getStats).toHaveBeenCalled();
    });
  });
});
