import { Global, Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('RedisModule');
        const host = configService.get<string>('REDIS_HOST');
        const port = configService.get<number>('REDIS_PORT');

        const client = new Redis({
          host,
          port,
          // Tối ưu hóa cho môi trường Scale & Microservices
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          retryStrategy: (times) => {
            logger.warn(`Redis connection retry attempt: ${times}`);
            return Math.min(times * 50, 2000); // Backoff strategy
          },
        });

        client.on('connect', () => logger.log('🚀 Redis Connected Successfully'));
        client.on('error', (err) => logger.error('❌ Redis Connection Error', err));

        return client;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}