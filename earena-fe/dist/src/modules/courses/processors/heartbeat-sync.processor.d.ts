import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Redis } from 'ioredis';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LessonProgressRepository } from '../repositories/lesson-progress.repository';
import { LessonsRepository } from '../repositories/lessons.repository';
import { EnrollmentsService } from '../services/enrollments.service';
export declare class HeartbeatSyncProcessor extends WorkerHost {
    private readonly redisClient;
    private readonly progressRepo;
    private readonly lessonsRepo;
    private readonly eventEmitter;
    private readonly enrollmentsService;
    private readonly logger;
    private readonly COMPLETION_THRESHOLD;
    constructor(redisClient: Redis, progressRepo: LessonProgressRepository, lessonsRepo: LessonsRepository, eventEmitter: EventEmitter2, enrollmentsService: EnrollmentsService);
    process(job: Job): Promise<void>;
}
