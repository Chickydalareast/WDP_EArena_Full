import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((resData) => {
        // Xử lý an toàn khi Service trả về rỗng
        if (resData === null || resData === undefined) {
          return { statusCode, message: 'Success', data: null as any };
        }

        // Kịch bản chuẩn: Nếu Controller chủ động trả về dạng { message, data, meta }
        if (typeof resData === 'object' && 'data' in resData) {
          return {
            statusCode,
            message: resData.message || 'Success',
            data: resData.data,
            ...(resData.meta && { meta: resData.meta })
          };
        }

        // Fallback: Nếu Controller chỉ ném ra data thô, wrap toàn bộ vào `data`
        // TUYỆT ĐỐI KHÔNG bóc tách bừa bãi key `message` của business entity
        return {
          statusCode,
          message: 'Success',
          data: resData,
        };
      }),
    );
  }
}