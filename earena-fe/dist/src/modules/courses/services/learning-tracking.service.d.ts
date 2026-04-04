import { OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SyncHeartbeatPayload } from '../interfaces/learning-tracking.interface';
import { LessonProgressRepository } from '../repositories/lesson-progress.repository';
import { LessonsRepository } from '../repositories/lessons.repository';
import { EnrollmentsService } from './enrollments.service';
export declare class LearningTrackingService implements OnModuleInit {
    private readonly redisClient;
    private readonly trackingQueue;
    private readonly progressRepo;
    private readonly lessonsRepo;
    private readonly enrollmentsService;
    private readonly eventEmitter;
    private readonly logger;
    private readonly BUCKET_KEY;
    private readonly COMPLETION_THRESHOLD;
    constructor(redisClient: Redis, trackingQueue: Queue, progressRepo: LessonProgressRepository, lessonsRepo: LessonsRepository, enrollmentsService: EnrollmentsService, eventEmitter: EventEmitter2);
    onModuleInit(): Promise<void>;
    recordHeartbeat(payload: SyncHeartbeatPayload): Promise<void>;
    private processInstantCompletion;
}
