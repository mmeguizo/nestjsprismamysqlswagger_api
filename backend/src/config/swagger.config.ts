import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Swagger configuration with Basic Auth protection
 *
 * @description Sets up Swagger documentation with:
 * - Basic auth protection (username/password from .env)
 * - JWT Bearer token for API authentication
 * - Custom styling and configuration
 *
 * ## Environment Variables:
 * - SWAGGER_USERNAME: Username for Swagger access
 * - SWAGGER_PASSWORD: Password for Swagger access
 * - SWAGGER_ENABLED: Enable/disable Swagger (default: true in dev)
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle(process.env.SWAGGER_TITLE || 'Institutional Dashboard Monitoring API')
    .setDescription(
      process.env.SWAGGER_DESCRIPTION ||
        `
## University Institutional Dashboard Monitoring System API

This API provides endpoints for managing university users, authentication, and related services.

### Authentication

#### JWT Token Authentication
All API endpoints (except auth and health) require JWT authentication.

**How to authenticate:**
1. Login via \`POST /api/v1/auth/login\` or Google OAuth
2. Copy the \`accessToken\` from response
3. Click "Authorize" button above
4. Enter token in format: \`Bearer <your-token>\`
5. Click "Authorize" to apply to all requests

**Token Lifecycle:**
- Access Token: 15 minutes
- Refresh Token: 7 days
- Use \`POST /api/v1/auth/refresh\` to get new tokens

### Google OAuth Flow
1. Open \`GET /api/v1/auth/google\` in browser/popup
2. Login with Google account
3. Redirected to frontend with tokens in URL
4. Store tokens and use for API calls

### Response Format
All endpoints return responses in a standardized format:

\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2026-02-04T10:00:00.000Z"
}
\`\`\`

### Pagination
List endpoints support pagination with the following query parameters:
- \`page\`: Page number (default: 1)
- \`limit\`: Items per page (default: 10, max: 100)

### User Roles
- **ADMIN**: Full system access
- **PRESIDENT**: University president
- **VICE_PRESIDENT**: Vice president level
- **DIRECTOR**: Department director
- **OFFICE_HEAD**: Office head

### Error Codes
- \`400\`: Bad Request - Validation failed
- \`401\`: Unauthorized - Authentication required
- \`403\`: Forbidden - Insufficient permissions
- \`404\`: Not Found - Resource does not exist
- \`409\`: Conflict - Resource already exists
- \`500\`: Internal Server Error
      `,
    )
    .setVersion(process.env.SWAGGER_VERSION || '1.0')
    .setContact('API Support', 'https://university.edu/support', 'api-support@university.edu')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Development Server')
    .addServer('https://api.university.edu', 'Production Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Login, logout, and token management')
    .addTag('Users', 'User management endpoints')
    .addTag('Health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(process.env.SWAGGER_PATH || 'api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'nord',
      },
    },
    customSiteTitle: 'Institutional Dashboard MonitorinAPI Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { font-size: 2rem; }
    `,
  });
}
