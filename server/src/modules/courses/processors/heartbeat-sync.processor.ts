import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LessonProgressRepository } from '../repositories/lesson-progress.repository';
import { LessonsRepository } from '../repositories/lessons.repository';
import { EnrollmentsService } from '../services/enrollments.service';
import { ProgressEventPattern, LessonCompletedEventPayload } from '../constants/progress-event.constant';

@Processor('learning-tracking')
export class HeartbeatSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(HeartbeatSyncProcessor.name);
  private readonly COMPLETION_THRESHOLD = 0.9;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly progressRepo: LessonProgressRepository,
    private readonly lessonsRepo: LessonsRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly enrollmentsService: EnrollmentsService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.debug(`[Worker] Bắt đầu đồng bộ Heartbeat Buffer xuống DB...`);
    const currentBucket = Math.floor(Date.now() / 60000);

    const keys = await this.redisClient.smembers('learning:hb_buckets');
    if (!keys || keys.length === 0) return;

    const lessonDurationCache = new Map<string, number>();

    for (const key of keys) {
      const parts = key.split(':');
      const [prefix, userId, courseId, lessonId, bucketStr] = parts;
      const bucket = parseInt(bucketStr, 10);

      if (bucket >= currentBucket) continue;

      try {
        const data = await this.redisClient.hgetall(key);
        if (!data || !data.watchTime) continue;

        const watchTimeInc = parseInt(data.watchTime, 10);
        const lastPos = parseFloat(data.lastPosition);

        const updatedProgress = await this.progressRepo.atomicUpsertProgress(
          userId, courseId, lessonId,
          { incWatchTime: watchTimeInc, setLastPosition: lastPos }
        );

        if (!updatedProgress) continue;

        if (!updatedProgress.isCompleted) {
          let duration: number = lessonDurationCache.get(lessonId) || 0;

          if (duration === 0) {
            const lessonDoc = await this.lessonsRepo.findByIdSafe(lessonId, {
              populate: [{ path: 'primaryVideoId', select: 'duration' }]
            });

            const video = lessonDoc?.primaryVideoId as any;
            duration = (video && typeof video.duration === 'number') ? video.duration : 0;

            if (duration === 0) {
              this.logger.warn(`[DATA BLIND SPOT]: Video của Bài học ${lessonId} bị thiếu trường 'duration' trong DB Media! Đang kích hoạt Fallback 10 giây để test.`);
              duration = 10;
            }

            lessonDurationCache.set(lessonId, duration);
          }

          if (updatedProgress.watchTime >= duration * this.COMPLETION_THRESHOLD) {
            await this.progressRepo.updateByIdSafe(
              updatedProgress._id as Types.ObjectId,
              { $set: { isCompleted: true, completedAt: new Date() } }
            );

            this.logger.log(`🎉 [Heartbeat] User ${userId} đã hoàn thành Video Bài ${lessonId}`);

            try {
              await this.enrollmentsService.markLessonCompleted({ userId, courseId, lessonId });
              this.logger.log(`[Heartbeat] Đã đồng bộ % Progress khóa học cho User ${userId}`);
            } catch (enrollErr: any) {
              this.logger.error(`[Heartbeat] Lỗi cập nhật Enrollment: ${enrollErr.message}`);
            }

            this.eventEmitter.emit(ProgressEventPattern.LESSON_COMPLETED, {
              userId, courseId, lessonId, isFirstCompletion: true
            } as LessonCompletedEventPayload);
          }
        }

        await this.redisClient.srem('learning:hb_buckets', key);
        await this.redisClient.del(key);

      } catch (error: any) {
        this.logger.error(`Lỗi đồng bộ bucket ${key}: ${error.message}`);
      }
    }
  }
}