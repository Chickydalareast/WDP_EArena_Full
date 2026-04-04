import { Injectable, Inject, Logger, OnModuleInit, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SyncHeartbeatPayload } from '../interfaces/learning-tracking.interface';

import { LessonProgressRepository } from '../repositories/lesson-progress.repository';
import { LessonsRepository } from '../repositories/lessons.repository';
import { EnrollmentsService } from './enrollments.service';
import {
  ProgressEventPattern,
  LessonCompletedEventPayload,
} from '../constants/progress-event.constant';
import { RedisService } from 'src/common/redis/redis.service';
import { EnrollmentsRepository } from '../repositories/enrollments.repository';
import { IGetCourseMembersParams, IStudentAnalyticsParams, IStudentLessonAttemptsParams } from '../interfaces/teacher-tracking.interface';
import { CoursesRepository } from '../courses.repository';
import { ExamSubmissionsRepository } from 'src/modules/exams/exam-submissions.repository';
import { EnrollmentStatus } from '../schemas/enrollment.schema';

@Injectable()
export class LearningTrackingService implements OnModuleInit {
  private readonly logger = new Logger(LearningTrackingService.name);
  private readonly BUCKET_KEY = 'learning:hb_buckets';
  private readonly COMPLETION_THRESHOLD = 0.9;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    @InjectQueue('learning-tracking') private readonly trackingQueue: Queue,
    private readonly progressRepo: LessonProgressRepository,
    private readonly lessonsRepo: LessonsRepository,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly redisService: RedisService,
    private readonly enrollmentsRepo: EnrollmentsRepository,
    private readonly examSubmissionsRepo: ExamSubmissionsRepository,
    private readonly coursesRepo: CoursesRepository,
  ) {}

  async onModuleInit() {
    const repeatableJobs = await this.trackingQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await this.trackingQueue.removeRepeatableByKey(job.key);
    }

    await this.trackingQueue.add(
      'sync-heartbeat-job',
      {},
      {
        repeat: { pattern: '* * * * *' },
      },
    );
    this.logger.log(
      '⏰ Đã thiết lập động cơ đồng bộ Heartbeat chạy mỗi 1 phút',
    );
  }

  async recordHeartbeat(payload: SyncHeartbeatPayload): Promise<void> {
    const currentMinuteBucket = Math.floor(Date.now() / 60000);
    const key = `hb:${payload.userId}:${payload.courseId}:${payload.lessonId}:${currentMinuteBucket}`;

    const pipeline = this.redisClient.pipeline();
    pipeline.hincrby(key, 'watchTime', payload.delta);
    pipeline.hset(key, 'lastPosition', payload.lastPosition);
    pipeline.sadd(this.BUCKET_KEY, key);
    pipeline.expire(key, 7200);
    await pipeline.exec();

    if (payload.isEnded) {
      this.logger.debug(
        `[Fast-Lane] Đang xử lý chấm điểm tức thời cho Video ${payload.lessonId}...`,
      );
      await this.processInstantCompletion(payload, key);
    }
  }

  private async processInstantCompletion(
    payload: SyncHeartbeatPayload,
    redisKey: string,
  ) {
    try {
      const data = await this.redisClient.hgetall(redisKey);
      if (!data || !data.watchTime) return;

      const watchTimeInc = parseInt(data.watchTime, 10);
      const lastPos = parseFloat(data.lastPosition);

      const updatedProgress = await this.progressRepo.atomicUpsertProgress(
        payload.userId,
        payload.courseId,
        payload.lessonId,
        { incWatchTime: watchTimeInc, setLastPosition: lastPos },
      );

      if (updatedProgress && !updatedProgress.isCompleted) {
        const lessonDoc = await this.lessonsRepo.findByIdSafe(
          payload.lessonId,
          {
            populate: [{ path: 'primaryVideoId', select: 'duration' }],
          },
        );

        let duration = (lessonDoc?.primaryVideoId as any)?.duration || 0;

        if (duration === 0) {
          this.logger.warn(
            `⚠️ [DATA BLIND SPOT]: Video thiếu duration! Kích hoạt Fallback 10s.`,
          );
          duration = 10;
        }

        if (
          duration > 0 &&
          updatedProgress.watchTime >= duration * this.COMPLETION_THRESHOLD
        ) {
          await this.progressRepo.updateByIdSafe(updatedProgress._id, {
            $set: { isCompleted: true, completedAt: new Date() },
          });

          await this.enrollmentsService.markLessonCompleted({
            userId: payload.userId,
            courseId: payload.courseId,
            lessonId: payload.lessonId,
          });

          this.logger.log(
            ` [Fast-Lane] User ${payload.userId} đã hoàn thành Video Bài ${payload.lessonId}`,
          );

          this.eventEmitter.emit(ProgressEventPattern.LESSON_COMPLETED, {
            userId: payload.userId,
            courseId: payload.courseId,
            lessonId: payload.lessonId,
            isFirstCompletion: true,
          } as LessonCompletedEventPayload);
        }
      }

      await this.redisClient.srem(this.BUCKET_KEY, redisKey);
      await this.redisClient.del(redisKey);
    } catch (error: any) {
      this.logger.error(
        `[Fast-Lane Error] Lỗi khi xử lý chấm điểm tức thời: ${error.message}`,
      );
    }
  }

  async getCourseMembersList(params: IGetCourseMembersParams) {
    const course = await this.coursesRepo.findByIdSafe(params.courseId, { select: 'teacherId' });
    if (!course || course.teacherId.toString() !== params.teacherId) {
      throw new ForbiddenException('Bạn không có quyền truy cập dữ liệu của khóa học này.');
    }

    const cacheKey = `teacher_dashboard:members:${params.courseId}:${params.page}:${params.limit}:${params.search || 'all'}:${params.sortBy}:${params.sortOrder}`;
    
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const { data, total } = await this.enrollmentsRepo.getMembersWithProgress(params);

    const result = {
      data,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };

    await this.redisService.set(cacheKey, JSON.stringify(result), 300);

    return result;
  }

  private async validateTeacherAndStudentAccess(courseId: string, teacherId: string, studentId: string) {
    const course = await this.coursesRepo.findByIdSafe(courseId, { select: 'teacherId' });
    if (!course || course.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền truy cập dữ liệu của khóa học này.');
    }

    const enrollment = await this.enrollmentsRepo.findOneSafe({
      courseId: new Types.ObjectId(courseId),
      userId: new Types.ObjectId(studentId),
      status: EnrollmentStatus.ACTIVE
    }, { select: '_id' });

    if (!enrollment) {
      throw new NotFoundException('Học viên này không tồn tại hoặc không đăng ký khóa học này.');
    }
  }

  async getStudentExamsOverview(params: IStudentAnalyticsParams) {
    await this.validateTeacherAndStudentAccess(params.courseId, params.teacherId, params.studentId);

    const cacheKey = `teacher_dashboard:course:${params.courseId}:student:${params.studentId}:analytics:overview:p${params.page}:l${params.limit}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);

    const result = await this.examSubmissionsRepo.getStudentHistoryOverviewData(
      params.studentId,
      params.page,
      params.limit,
      params.courseId
    );

    await this.redisService.set(cacheKey, JSON.stringify(result), 300);
    return result;
  }

  async getStudentLessonAttempts(params: IStudentLessonAttemptsParams) {
    await this.validateTeacherAndStudentAccess(params.courseId, params.teacherId, params.studentId);

    const cacheKey = `teacher_dashboard:course:${params.courseId}:student:${params.studentId}:lesson:${params.lessonId}:attempts:p${params.page}:l${params.limit}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);

    const result = await this.examSubmissionsRepo.getLessonAttemptsData(
      params.studentId,
      params.lessonId,
      params.page,
      params.limit
    );

    await this.redisService.set(cacheKey, JSON.stringify(result), 300);
    return result;
  }
}
