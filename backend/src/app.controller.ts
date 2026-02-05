import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './modules/auth/decorators';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'API Root', description: 'Returns API information' })
  @ApiResponse({ status: 200, description: 'API information' })
  getRoot() {
    return this.appService.getApiInfo();
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health Check', description: 'Returns health status of the API' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  getHealth() {
    return this.appService.getHealth();
  }
}
