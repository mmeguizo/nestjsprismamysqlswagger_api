import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRoot', () => {
    it('should return API information', () => {
      const result = controller.getRoot();

      expect(result).toHaveProperty('name', 'Institutional Dashboard MonitorinAPI');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('documentation');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('getHealth', () => {
    it('should return healthy status when database is connected', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ 1: 1 }]);

      const result = await controller.getHealth();

      expect(result).toHaveProperty('status', 'ok');
      expect(result.services.database).toBe('healthy');
    });

    it('should return unhealthy database status when database fails', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(new Error('DB Error'));

      const result = await controller.getHealth();

      expect(result).toHaveProperty('status', 'ok');
      expect(result.services.database).toBe('unhealthy');
    });
  });
});
