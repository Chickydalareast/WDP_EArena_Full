import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { SyncHeartbeatPayload } from '../interfaces/learning-tracking.interface';

@Injectable()
export class LearningTrackingService {
    private readonly logger = new Logger(LearningTrackingService.name);
    private readonly BUCKET_KEY = 'learning:hb_buckets';

    constructor(
        @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    ) { }

    async recordHeartbeat(payload: SyncHeartbeatPayload): Promise<void> {
        const currentMinuteBucket = Math.floor(Date.now() / 60000);

        const key = `hb:${payload.userId}:${payload.courseId}:${payload.lessonId}:${currentMinuteBucket}`;

        const pipeline = this.redisClient.pipeline();

        pipeline.hincrby(key, 'watchTime', payload.delta);
        pipeline.hset(key, 'lastPosition', payload.lastPosition);
        pipeline.sadd(this.BUCKET_KEY, key);
        pipeline.expire(key, 7200);

        await pipeline.exec();
    }
}