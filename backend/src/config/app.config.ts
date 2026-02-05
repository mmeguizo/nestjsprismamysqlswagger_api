export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
}

export interface DatabaseConfig {
  url: string;
}

export interface SwaggerConfig {
  enabled: boolean;
  title: string;
  description: string;
  version: string;
  path: string;
}

export interface PaginationConfig {
  defaultPageSize: number;
  maxPageSize: number;
}

export interface Config {
  app: AppConfig;
  database: DatabaseConfig;
  swagger: SwaggerConfig;
  pagination: PaginationConfig;
}

/**
 * Configuration factory
 */
export default (): Config => ({
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || 'api',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
    title: process.env.SWAGGER_TITLE || 'Institutional Dashboard MonitorinAPI',
    description:
      process.env.SWAGGER_DESCRIPTION || 'University Institutional Dashboard MonitorinBackend API',
    version: process.env.SWAGGER_VERSION || '1.0',
    path: process.env.SWAGGER_PATH || 'api/docs',
  },
  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '10', 10),
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
  },
});
