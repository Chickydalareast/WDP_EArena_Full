import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../redis/redis.service';
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly DEFAULT_LIMIT: RateLimitOptions = { points: 120, duration: 60 };

  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let rateLimitOptions = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rateLimitOptions) {
      rateLimitOptions = this.DEFAULT_LIMIT;
    }

    const request = context.switchToHttp().getRequest();
    const ip = request.headers['x-forwarded-for'] || request.ip || request.connection?.remoteAddress || 'unknown';
    const routePath = request.route.path;
    
    const key = `rate_limit:${ip}:${routePath}`;
    
    const pipeline = this.redisService.getPipeline();
    pipeline.incr(key); 
    pipeline.ttl(key);  
    const results = await pipeline.exec();

    if (!results) {
        throw new HttpException('Redis Pipeline Failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const incrError = results[0][0];
    const ttlError = results[1][0];  
    
    if (incrError || ttlError) {
        throw new HttpException('Redis Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const requestsMade = results[0][1] as number; 
    const currentTtl = results[1][1] as number;   

    if (requestsMade === 1 || currentTtl === -1) {
      await this.redisService.expire(key, rateLimitOptions.duration);
    }

    if (requestsMade > rateLimitOptions.points) {
      throw new HttpException(
        `Hệ thống đang chịu tải cao. Vui lòng thử lại sau ${rateLimitOptions.duration} giây!`, 
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return true;
  }
}