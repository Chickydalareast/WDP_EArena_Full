import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BYPASS_TRANSFORM_KEY } from '../decorators/bypass-transform.decorator';

export interface StandardResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, StandardResponse<T> | any> {
  constructor(private readonly reflector: Reflector) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T> | any> {
    const bypassTransform = this.reflector.getAllAndOverride<boolean>(BYPASS_TRANSFORM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (bypassTransform) {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((resData) => {
        if (resData === null || resData === undefined) {
          return { statusCode, message: 'Success', data: null as any };
        }

        const isPreFormattedResponse =
          typeof resData === 'object' &&
          !Array.isArray(resData) &&
          'data' in resData &&
          Object.keys(resData).every(key => ['data', 'meta', 'message'].includes(key));

        if (isPreFormattedResponse) {
          return {
            statusCode,
            message: resData.message || 'Success',
            data: resData.data,
            ...(resData.meta && { meta: resData.meta })
          };
        }

        return {
          statusCode,
          message: 'Success',
          data: resData,
        };
      }),
    );
  }
}