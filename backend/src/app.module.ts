import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma';
import { UsersModule } from './modules/users';
import { AuthModule, JwtAuthGuard } from './modules/auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    PrismaModule,

    // Authentication
    AuthModule,

    // Feature Modules
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply JWT guard globally - use @Public() decorator to skip
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
