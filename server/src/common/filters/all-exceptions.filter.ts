// src/common/filters/all-exceptions.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    if (!httpAdapter) {
      return; // Fallback an toàn nếu httpAdapter crash
    }

    const ctx = host.switchToHttp();
    
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal Server Error' };

    // [CTO FIX]: Thuật toán Flatten (Làm phẳng) Message
    let flatMessage: string | string[] = 'Internal Server Error';
    let errorType = 'Error';

    if (typeof exceptionResponse === 'string') {
      flatMessage = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      // Ép kiểu để bóc tách message và error name do class-validator / NestJS ném ra
      flatMessage = (exceptionResponse as any).message || flatMessage;
      errorType = (exceptionResponse as any).error || errorType;
    }
    
    this.logger.error(
      `[Exception] Status: ${httpStatus} | Msg: ${JSON.stringify(flatMessage)}`,
      exception instanceof Error ? exception.stack : '',
    );

    // Chuẩn hóa JSON Response duy nhất cho FE parse
    const responseBody = {
      statusCode: httpStatus,
      message: flatMessage,  // Đảm bảo LUÔN LÀ string hoặc string[]
      error: errorType,      // Ví dụ: 'Bad Request', 'Not Found'
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}