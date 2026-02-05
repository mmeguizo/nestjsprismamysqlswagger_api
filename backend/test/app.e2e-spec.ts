import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma';
import { AllExceptionsFilter } from '../src/common/filters';
import { TransformInterceptor } from '../src/common/interceptors';

describe('UsersController (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

    // Apply the same configuration as main.ts
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    // Clean up test data
    if (process.env.NODE_ENV === 'test') {
      await prisma.user.deleteMany({
        where: { email: { contains: '@test.e2e.com' } },
      });
    }
    await app.close();
  });

  describe('/api/v1/users (POST)', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: `test-${Date.now()}@test.e2e.com`,
        firstName: 'E2E',
        lastName: 'Test',
        password: 'SecureP@ss123',
        role: 'STUDENT',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(createUserDto.email);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 400 for invalid email', async () => {
      const createUserDto = {
        email: 'invalid-email',
        firstName: 'Test',
        lastName: 'User',
        password: 'SecureP@ss123',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(createUserDto)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for weak password', async () => {
      const createUserDto = {
        email: 'valid@test.e2e.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'weak', // Too short, no uppercase, no number
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(createUserDto)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 409 for duplicate email', async () => {
      const createUserDto = {
        email: `duplicate-${Date.now()}@test.e2e.com`,
        firstName: 'First',
        lastName: 'User',
        password: 'SecureP@ss123',
      };

      // Create first user
      await request(app.getHttpServer()).post('/api/v1/users').send(createUserDto).expect(201);

      // Try to create duplicate
      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(createUserDto)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('already exists');
    });
  });

  describe('/api/v1/users (GET)', () => {
    it('should return paginated users', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page', 1);
      expect(response.body.meta).toHaveProperty('limit', 10);
    });

    it('should filter by role', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .query({ role: 'STUDENT' })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((user: { role: string }) => {
        expect(user.role).toBe('STUDENT');
      });
    });
  });

  describe('/api/v1/users/:id (GET)', () => {
    it('should return 404 for non-existent user', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/users/99999').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.statusCode).toBe(404);
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/users/invalid').expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('/api/v1/health (GET)', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

      expect(response.body.data.status).toBe('ok');
      expect(response.body.data.services).toHaveProperty('database');
    });
  });
});
