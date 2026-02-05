import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fastifyBasicAuth from '@fastify/basic-auth';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { AllExceptionsFilter } from './common/filters';
import { LoggingInterceptor, TransformInterceptor } from './common/interceptors';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Create Fastify adapter with options
  const fastifyAdapter = new FastifyAdapter({
    logger: false, // We use NestJS logger
    trustProxy: true,
  });

  // Create NestJS application with Fastify
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');

  // Get Swagger credentials from environment
  const swaggerUsername = configService.get<string>('SWAGGER_USERNAME', 'admin');
  const swaggerPassword = configService.get<string>('SWAGGER_PASSWORD', 'admin123');

  // Register Fastify basic auth for Swagger protection
  const fastifyInstance = app.getHttpAdapter().getInstance();
  await fastifyInstance.register(fastifyBasicAuth, {
    validate: (
      username: string,
      password: string,
      _req: any,
      _reply: any,
      done: (err?: Error) => void,
    ) => {
      if (username === swaggerUsername && password === swaggerPassword) {
        done();
      } else {
        done(new Error('Invalid credentials'));
      }
    },
    authenticate: { realm: 'Swagger Documentation' },
  });

  // Add onRequest hook to protect Swagger routes with basic auth
  fastifyInstance.addHook('onRequest', (request: any, reply: any, done: any) => {
    const url = request.url;
    // Protect /api/docs and related Swagger routes
    if (url.startsWith('/api/docs') || url.startsWith('/api-json') || url.startsWith('/api-yaml')) {
      fastifyInstance.basicAuth(request, reply, (err?: Error) => {
        if (err) {
          // Send proper 401 with WWW-Authenticate header to prompt browser
          reply
            .code(401)
            .header('WWW-Authenticate', 'Basic realm="Swagger Documentation"')
            .send({ statusCode: 401, message: 'Authentication required' });
          return; // Stop processing - don't call done()
        }
        done(); // Authentication successful, continue
      });
    } else {
      done();
    }
  });

  // Enable CORS
  app.enableCors({
    origin: true, // Configure properly for production
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Set global prefix
  app.setGlobalPrefix(apiPrefix);

  // Enable API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip non-whitelisted properties
      forbidNonWhitelisted: true, // Throw error for non-whitelisted properties
      transform: true, // Auto-transform payloads
      transformOptions: {
        enableImplicitConversion: true,
      },
      validateCustomDecorators: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // Setup Swagger documentation
  const swaggerEnabled = configService.get<boolean>('swagger.enabled', true);
  if (swaggerEnabled) {
    setupSwagger(app);
    logger.log(`📚 Swagger documentation available at /api/docs`);
    logger.log(`🔐 Swagger protected with basic auth (user: ${swaggerUsername})`);
  }

  // Start server
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📍 API Prefix: /${apiPrefix}`);
  logger.log(`🌍 Environment: ${configService.get('app.nodeEnv')}`);
}

bootstrap().catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
