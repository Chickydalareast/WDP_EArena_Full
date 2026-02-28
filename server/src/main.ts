import { NestFactory, HttpAdapterHost } from '@nestjs/core'; // <-- Thêm HttpAdapterHost
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser'; // <-- Đổi thành import default (Bỏ `* as`)

import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Security Headers
  app.use(helmet());

  // 2. Cookie Parser (Fix lỗi CJS interop)
  app.use(cookieParser());

  // 3. CORS Configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true, // Bắt buộc để nhận Refresh Token
  });

  // 4. Global API Prefix & Versioning
  app.setGlobalPrefix('api/v1');

  // 5. Strict Validation Pipe (Cửa ngõ tử thần với Request rác)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // 6. Global Interceptor & Filter
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // FIX: Lấy instance của HttpAdapterHost từ DI Container và bơm vào Filter
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Master Server is running on: http://localhost:${port}/api/v1`);
}
bootstrap();