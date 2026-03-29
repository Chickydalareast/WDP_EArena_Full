import { NestFactory, HttpAdapterHost, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser'; 

import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

  app.use(cookieParser());

  const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const cleanOrigin = rawFrontendUrl.replace(/\/$/, ''); 

  app.enableCors({
    origin: [cleanOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Enterprise Backend is running on: http://localhost:${port}/api/v1`);
}
bootstrap();