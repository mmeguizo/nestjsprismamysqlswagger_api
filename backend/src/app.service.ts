import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getApiInfo() {
    return {
      name: 'Institutional Dashboard MonitorinAPI',
      version: '1.0.0',
      description: 'University Institutional Dashboard Monitorin System API',
      documentation: '/api/docs',
      timestamp: new Date().toISOString(),
    };
  }

  async getHealth() {
    let dbStatus = 'healthy';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'unhealthy';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbStatus,
      },
    };
  }
}
