import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Prisma } from '@prisma/client';

interface ErrorResponseBody {
  success: boolean;
  error: {
    statusCode: number;
    message: string;
    details?: unknown;
    path?: string;
  };
  timestamp: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: unknown = undefined;

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) || message;
        details = responseObj.errors || responseObj.details;
      }
    }
    // Handle Prisma errors
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const { code } = exception;

      switch (code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'A record with this value already exists';
          details = exception.meta;
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint failed';
          break;
        default:
          message = `Database error: ${code}`;
      }
    }
    // Handle Prisma validation errors
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided';
    }
    // Handle other errors
    else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
    }

    const errorResponse: ErrorResponseBody = {
      success: false,
      error: {
        statusCode: status,
        message,
        details,
        path: request.url,
      },
      timestamp: new Date().toISOString(),
    };

    // Log error
    if (status >= 500) {
      this.logger.error(`[${request.method}] ${request.url} - ${status}: ${message}`, exception);
    } else {
      this.logger.warn(`[${request.method}] ${request.url} - ${status}: ${message}`);
    }

    response.status(status).send(errorResponse);
  }
}
