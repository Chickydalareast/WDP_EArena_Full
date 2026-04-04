import { OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
export declare class RedisService implements OnModuleDestroy {
    private readonly redisClient;
    constructor(redisClient: Redis);
    onModuleDestroy(): void;
    get(key: string): Promise<string | null>;
    set(key: string, value: string | number, ttlSeconds?: number): Promise<void>;
    del(...keys: string[]): Promise<void>;
    setNx(key: string, value: string | number, ttlSeconds: number): Promise<boolean>;
    incr(key: string): Promise<number>;
    expire(key: string, ttlSeconds: number): Promise<boolean>;
    hset(key: string, field: string, value: string): Promise<number>;
    hgetall(key: string): Promise<Record<string, string>>;
    sadd(key: string, ...members: string[]): Promise<number>;
    smembers(key: string): Promise<string[]>;
    getPipeline(): import("ioredis").ChainableCommander;
}
