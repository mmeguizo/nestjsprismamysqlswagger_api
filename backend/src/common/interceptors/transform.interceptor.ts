import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => {
        // If already formatted (has success property), return as-is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Otherwise, wrap in standard format
        return {
          success: true,
          data,
          message: 'Operation successful',
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
