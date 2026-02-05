# Coding Instructions & Best Practices

> **This file serves as a reference for AI assistants and developers to maintain consistency across the codebase.**

---

## 🏗️ Project Architecture

```
backend/
├── src/
│   ├── modules/           # Feature modules (users, auth, etc.)
│   │   └── [module]/
│   │       ├── dto/       # Data Transfer Objects with validations
│   │       ├── entities/  # Prisma model representations
│   │       ├── [module].controller.ts
│   │       ├── [module].service.ts
│   │       ├── [module].module.ts
│   │       └── [module].controller.spec.ts
│   ├── common/            # Shared utilities
│   │   ├── decorators/    # Custom decorators
│   │   ├── filters/       # Exception filters
│   │   ├── guards/        # Authentication guards
│   │   ├── interceptors/  # Request/Response interceptors
│   │   ├── pipes/         # Validation pipes
│   │   └── utils/         # Utility functions
│   ├── prisma/            # Prisma service and module
│   ├── config/            # Configuration files
│   ├── app.module.ts      # Root module
│   └── main.ts            # Application entry point
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Database migrations
│   └── seed.ts            # Database seeding
└── test/                  # E2E tests
```

---

## 📝 Coding Standards

### 1. Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `user.controller.ts` |
| Classes | PascalCase | `UserController` |
| Methods/Functions | camelCase | `findAllUsers()` |
| Variables | camelCase | `userName` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_PAGE_SIZE` |
| DTOs | PascalCase + Dto suffix | `CreateUserDto` |
| Interfaces | PascalCase + prefix I (optional) | `IUserResponse` |
| Enums | PascalCase | `UserRole` |

### 2. File Organization

```typescript
// Order of imports
1. NestJS core imports
2. Third-party imports
3. Local imports (absolute paths)
4. Relative imports

// Order within a class
1. Static properties
2. Instance properties
3. Constructor
4. Lifecycle hooks (onModuleInit, etc.)
5. Public methods
6. Private methods
```

### 3. DTO Best Practices

```typescript
// ✅ GOOD: Use class-validator decorators with clear messages
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com', description: 'User email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @ApiPropertyOptional({ example: 'STUDENT', enum: ['STUDENT', 'FACULTY', 'ADMIN'] })
  @IsOptional()
  role?: string;
}
```

### 4. Controller Best Practices

```typescript
// ✅ GOOD: Use decorators for documentation and validation
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}
```

### 5. Service Best Practices

```typescript
// ✅ GOOD: Handle errors properly, use transactions when needed
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<User> {
    // Check for existing
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    return this.prisma.user.create({ data });
  }
}
```

### 6. Response Format

Always use consistent response format:

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2026-02-04T10:00:00.000Z"
}

// Error Response
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Validation failed",
    "details": [...]
  },
  "timestamp": "2026-02-04T10:00:00.000Z"
}

// Paginated Response
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

## ✅ Validation Rules

### Required Validations

1. **All DTOs must have validation decorators**
2. **All fields must have Swagger decorators**
3. **Use custom error messages for better UX**
4. **Validate query parameters for pagination**

### Common Validators to Use

```typescript
// Strings
@IsString(), @MinLength(), @MaxLength(), @Matches()

// Numbers
@IsNumber(), @Min(), @Max(), @IsInt(), @IsPositive()

// Special
@IsEmail(), @IsUUID(), @IsDate(), @IsEnum()

// Optional
@IsOptional(), @ValidateIf()

// Nested
@ValidateNested(), @Type(() => NestedDto)
```

---

## 🧪 Testing Guidelines

### Unit Tests

```typescript
describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a user', async () => {
    // Arrange
    const dto = { email: 'test@test.com', name: 'Test' };
    jest.spyOn(prisma.user, 'create').mockResolvedValue({ id: 1, ...dto });

    // Act
    const result = await service.create(dto);

    // Assert
    expect(result).toHaveProperty('id');
  });
});
```

### Test File Naming

- Unit tests: `*.spec.ts` (same folder as source)
- E2E tests: `*.e2e-spec.ts` (in `/test` folder)

---

## 🔧 Utility Functions

### Location: `src/common/utils/`

| Utility | Purpose |
|---------|---------|
| `response.util.ts` | Standardized API responses |
| `pagination.util.ts` | Pagination helpers |
| `transform.util.ts` | Data transformation |
| `validation.util.ts` | Custom validators |
| `date.util.ts` | Date manipulation |

---

## 🚫 Anti-Patterns to Avoid

```typescript
// ❌ BAD: No validation
@Post()
create(@Body() body: any) { ... }

// ❌ BAD: Business logic in controller
@Post()
async create(@Body() dto: CreateUserDto) {
  const exists = await this.prisma.user.findUnique(...);
  if (exists) throw new Error('Exists');
  return this.prisma.user.create(...);
}

// ❌ BAD: Catching all errors silently
try {
  await something();
} catch (e) {
  return null;
}

// ❌ BAD: Hardcoded values
const users = await this.prisma.user.findMany({ take: 10 });

// ❌ BAD: No error handling
async findOne(id: number) {
  return this.prisma.user.findUnique({ where: { id } });
}
```

---

## ✅ Patterns to Follow

```typescript
// ✅ GOOD: Proper validation
@Post()
create(@Body() dto: CreateUserDto) { ... }

// ✅ GOOD: Logic in service layer
@Post()
async create(@Body() dto: CreateUserDto) {
  return this.userService.create(dto);
}

// ✅ GOOD: Proper error handling
async findOne(id: number): Promise<User> {
  const user = await this.prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
  return user;
}

// ✅ GOOD: Use configuration
async findAll(query: PaginationDto) {
  const { page = 1, limit = DEFAULT_PAGE_SIZE } = query;
  return this.prisma.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
  });
}
```

---

## 📋 Checklist Before Committing

- [ ] All DTOs have validation decorators
- [ ] All endpoints have Swagger decorators
- [ ] Error handling is implemented
- [ ] Unit tests are written
- [ ] No hardcoded values (use config/constants)
- [ ] Response format is consistent
- [ ] No console.log (use Logger)
- [ ] Code is formatted (Prettier)
- [ ] No TypeScript errors
- [ ] Meaningful commit message

---

## 🔄 Git Commit Convention

```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

Example:
feat(users): add user registration endpoint
fix(auth): resolve token expiration issue
```
