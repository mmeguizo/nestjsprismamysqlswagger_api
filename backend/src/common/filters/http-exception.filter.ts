import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    let message: string | string[] = exception.message;
    let details: unknown = undefined;

    if (typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as Record<string, unknown>;
      if (Array.isArray(responseObj.message)) {
        message = responseObj.message;
      } else if (typeof responseObj.message === 'string') {
        message = responseObj.message;
      }
      details = responseObj.errors;
    }

    response.status(status).send({
      success: false,
      error: {
        statusCode: status,
        message,
        details,
        path: request.url,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
