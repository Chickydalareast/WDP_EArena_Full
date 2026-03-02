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
    // In một số trường hợp httpAdapter chưa sẵn sàng (rất hiếm)
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    // Xác định Status Code (Nếu là lỗi HTTP thì lấy code, nếu lỗi crash server thì 500)
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Lấy message lỗi
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal Server Error';
    
    // Log lỗi ra console để Developer biết đường sửa (Quan trọng theo yêu cầu của bạn)
    this.logger.error(
      `Exception Filter caught error: ${JSON.stringify(message)}`,
      exception instanceof Error ? exception.stack : '',
    );

    const responseBody = {
      statusCode: httpStatus,
      message: message, // Có thể là object hoặc string
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}