import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { randomUUID } from 'crypto';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  onModuleDestroy() {
    this.redisClient.disconnect();
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string | number, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redisClient.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length > 0) {
      await this.redisClient.del(...keys);
    }
  }

  async deleteByPattern(pattern: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = this.redisClient.scanStream({
        match: pattern,
        count: 100,
      });

      stream.on('data', async (keys: string[]) => {
        if (keys.length > 0) {
          stream.pause(); 
          await this.redisClient.del(...keys);
          stream.resume();
        }
      });

      stream.on('end', () => {
        this.logger.debug(`[Redis] Đã dọn dẹp các cache key khớp với pattern: ${pattern}`);
        resolve();
      });

      stream.on('error', (err) => {
        this.logger.error(`[Redis] Lỗi khi quét pattern ${pattern}`, err);
        reject(err);
      });
    });
  }

  async acquireLock(key: string, ttlSeconds: number): Promise<string | null> {
    const uuid = randomUUID();
    const result = await this.redisClient.set(key, uuid, 'EX', ttlSeconds, 'NX');
    return result === 'OK' ? uuid : null;
  }


  async releaseLockSafe(key: string, uuid: string): Promise<boolean> {
    const script = `
      if redis.call("get",KEYS[1]) == ARGV[1] then
          return redis.call("del",KEYS[1])
      else
          return 0
      end
    `;
    const result = await this.redisClient.eval(script, 1, key, uuid);
    return result === 1;
  }

  async setNx(key: string, value: string | number, ttlSeconds: number): Promise<boolean> {
    const result = await this.redisClient.set(key, value, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async incr(key: string): Promise<number> {
    return this.redisClient.incr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.redisClient.expire(key, ttlSeconds);
    return result === 1;
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return this.redisClient.hset(key, field, value);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.redisClient.hgetall(key);
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.redisClient.sadd(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return this.redisClient.smembers(key);
  }

  getPipeline() {
    return this.redisClient.pipeline();
  }
}