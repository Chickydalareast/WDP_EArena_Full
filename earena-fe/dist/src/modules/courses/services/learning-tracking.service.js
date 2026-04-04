"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LearningTrackingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningTrackingService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const ioredis_1 = require("ioredis");
const event_emitter_1 = require("@nestjs/event-emitter");
const lesson_progress_repository_1 = require("../repositories/lesson-progress.repository");
const lessons_repository_1 = require("../repositories/lessons.repository");
const enrollments_service_1 = require("./enrollments.service");
const progress_event_constant_1 = require("../constants/progress-event.constant");
let LearningTrackingService = LearningTrackingService_1 = class LearningTrackingService {
    redisClient;
    trackingQueue;
    progressRepo;
    lessonsRepo;
    enrollmentsService;
    eventEmitter;
    logger = new common_1.Logger(LearningTrackingService_1.name);
    BUCKET_KEY = 'learning:hb_buckets';
    COMPLETION_THRESHOLD = 0.9;
    constructor(redisClient, trackingQueue, progressRepo, lessonsRepo, enrollmentsService, eventEmitter) {
        this.redisClient = redisClient;
        this.trackingQueue = trackingQueue;
        this.progressRepo = progressRepo;
        this.lessonsRepo = lessonsRepo;
        this.enrollmentsService = enrollmentsService;
        this.eventEmitter = eventEmitter;
    }
    async onModuleInit() {
        const repeatableJobs = await this.trackingQueue.getRepeatableJobs();
        for (const job of repeatableJobs) {
            await this.trackingQueue.removeRepeatableByKey(job.key);
        }
        await this.trackingQueue.add('sync-heartbeat-job', {}, {
            repeat: { pattern: '* * * * *' },
        });
        this.logger.log('⏰ Đã thiết lập động cơ đồng bộ Heartbeat chạy mỗi 1 phút');
    }
    async recordHeartbeat(payload) {
        const currentMinuteBucket = Math.floor(Date.now() / 60000);
        const key = `hb:${payload.userId}:${payload.courseId}:${payload.lessonId}:${currentMinuteBucket}`;
        const pipeline = this.redisClient.pipeline();
        pipeline.hincrby(key, 'watchTime', payload.delta);
        pipeline.hset(key, 'lastPosition', payload.lastPosition);
        pipeline.sadd(this.BUCKET_KEY, key);
        pipeline.expire(key, 7200);
        await pipeline.exec();
        if (payload.isEnded) {
            this.logger.debug(`[Fast-Lane] Đang xử lý chấm điểm tức thời cho Video ${payload.lessonId}...`);
            await this.processInstantCompletion(payload, key);
        }
    }
    async processInstantCompletion(payload, redisKey) {
        try {
            const data = await this.redisClient.hgetall(redisKey);
            if (!data || !data.watchTime)
                return;
            const watchTimeInc = parseInt(data.watchTime, 10);
            const lastPos = parseFloat(data.lastPosition);
            const updatedProgress = await this.progressRepo.atomicUpsertProgress(payload.userId, payload.courseId, payload.lessonId, { incWatchTime: watchTimeInc, setLastPosition: lastPos });
            if (updatedProgress && !updatedProgress.isCompleted) {
                const lessonDoc = await this.lessonsRepo.findByIdSafe(payload.lessonId, {
                    populate: [{ path: 'primaryVideoId', select: 'duration' }],
                });
                let duration = lessonDoc?.primaryVideoId?.duration || 0;
                if (duration === 0) {
                    this.logger.warn(`⚠️ [DATA BLIND SPOT]: Video thiếu duration! Kích hoạt Fallback 10s.`);
                    duration = 10;
                }
                if (duration > 0 &&
                    updatedProgress.watchTime >= duration * this.COMPLETION_THRESHOLD) {
                    await this.progressRepo.updateByIdSafe(updatedProgress._id, {
                        $set: { isCompleted: true, completedAt: new Date() },
                    });
                    await this.enrollmentsService.markLessonCompleted({
                        userId: payload.userId,
                        courseId: payload.courseId,
                        lessonId: payload.lessonId,
                    });
                    this.logger.log(` [Fast-Lane] User ${payload.userId} đã hoàn thành Video Bài ${payload.lessonId}`);
                    this.eventEmitter.emit(progress_event_constant_1.ProgressEventPattern.LESSON_COMPLETED, {
                        userId: payload.userId,
                        courseId: payload.courseId,
                        lessonId: payload.lessonId,
                        isFirstCompletion: true,
                    });
                }
            }
            await this.redisClient.srem(this.BUCKET_KEY, redisKey);
            await this.redisClient.del(redisKey);
        }
        catch (error) {
            this.logger.error(`[Fast-Lane Error] Lỗi khi xử lý chấm điểm tức thời: ${error.message}`);
        }
    }
};
exports.LearningTrackingService = LearningTrackingService;
exports.LearningTrackingService = LearningTrackingService = LearningTrackingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_CLIENT')),
    __param(1, (0, bullmq_1.InjectQueue)('learning-tracking')),
    __metadata("design:paramtypes", [ioredis_1.Redis,
        bullmq_2.Queue,
        lesson_progress_repository_1.LessonProgressRepository,
        lessons_repository_1.LessonsRepository,
        enrollments_service_1.EnrollmentsService,
        event_emitter_1.EventEmitter2])
], LearningTrackingService);
//# sourceMappingURL=learning-tracking.service.js.map