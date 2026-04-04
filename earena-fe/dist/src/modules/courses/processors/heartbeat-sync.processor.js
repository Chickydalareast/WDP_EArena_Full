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
var HeartbeatSyncProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatSyncProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const event_emitter_1 = require("@nestjs/event-emitter");
const lesson_progress_repository_1 = require("../repositories/lesson-progress.repository");
const lessons_repository_1 = require("../repositories/lessons.repository");
const enrollments_service_1 = require("../services/enrollments.service");
const progress_event_constant_1 = require("../constants/progress-event.constant");
let HeartbeatSyncProcessor = HeartbeatSyncProcessor_1 = class HeartbeatSyncProcessor extends bullmq_1.WorkerHost {
    redisClient;
    progressRepo;
    lessonsRepo;
    eventEmitter;
    enrollmentsService;
    logger = new common_1.Logger(HeartbeatSyncProcessor_1.name);
    COMPLETION_THRESHOLD = 0.9;
    constructor(redisClient, progressRepo, lessonsRepo, eventEmitter, enrollmentsService) {
        super();
        this.redisClient = redisClient;
        this.progressRepo = progressRepo;
        this.lessonsRepo = lessonsRepo;
        this.eventEmitter = eventEmitter;
        this.enrollmentsService = enrollmentsService;
    }
    async process(job) {
        this.logger.debug(`[Worker] Bắt đầu đồng bộ Heartbeat Buffer xuống DB...`);
        const currentBucket = Math.floor(Date.now() / 60000);
        const keys = await this.redisClient.smembers('learning:hb_buckets');
        if (!keys || keys.length === 0)
            return;
        const lessonDurationCache = new Map();
        for (const key of keys) {
            const parts = key.split(':');
            const [prefix, userId, courseId, lessonId, bucketStr] = parts;
            const bucket = parseInt(bucketStr, 10);
            if (bucket >= currentBucket)
                continue;
            try {
                const data = await this.redisClient.hgetall(key);
                if (!data || !data.watchTime)
                    continue;
                const watchTimeInc = parseInt(data.watchTime, 10);
                const lastPos = parseFloat(data.lastPosition);
                const updatedProgress = await this.progressRepo.atomicUpsertProgress(userId, courseId, lessonId, { incWatchTime: watchTimeInc, setLastPosition: lastPos });
                if (!updatedProgress)
                    continue;
                if (!updatedProgress.isCompleted) {
                    let duration = lessonDurationCache.get(lessonId) || 0;
                    if (duration === 0) {
                        const lessonDoc = await this.lessonsRepo.findByIdSafe(lessonId, {
                            populate: [{ path: 'primaryVideoId', select: 'duration' }],
                        });
                        const video = lessonDoc?.primaryVideoId;
                        duration =
                            video && typeof video.duration === 'number' ? video.duration : 0;
                        if (duration === 0) {
                            this.logger.warn(`[DATA BLIND SPOT]: Video của Bài học ${lessonId} bị thiếu trường 'duration' trong DB Media! Đang kích hoạt Fallback 10 giây để test.`);
                            duration = 10;
                        }
                        lessonDurationCache.set(lessonId, duration);
                    }
                    if (updatedProgress.watchTime >=
                        duration * this.COMPLETION_THRESHOLD) {
                        await this.progressRepo.updateByIdSafe(updatedProgress._id, {
                            $set: { isCompleted: true, completedAt: new Date() },
                        });
                        this.logger.log(`🎉 [Heartbeat] User ${userId} đã hoàn thành Video Bài ${lessonId}`);
                        try {
                            await this.enrollmentsService.markLessonCompleted({
                                userId,
                                courseId,
                                lessonId,
                            });
                            this.logger.log(`[Heartbeat] Đã đồng bộ % Progress khóa học cho User ${userId}`);
                        }
                        catch (enrollErr) {
                            this.logger.error(`[Heartbeat] Lỗi cập nhật Enrollment: ${enrollErr.message}`);
                        }
                        this.eventEmitter.emit(progress_event_constant_1.ProgressEventPattern.LESSON_COMPLETED, {
                            userId,
                            courseId,
                            lessonId,
                            isFirstCompletion: true,
                        });
                    }
                }
                await this.redisClient.srem('learning:hb_buckets', key);
                await this.redisClient.del(key);
            }
            catch (error) {
                this.logger.error(`Lỗi đồng bộ bucket ${key}: ${error.message}`);
            }
        }
    }
};
exports.HeartbeatSyncProcessor = HeartbeatSyncProcessor;
exports.HeartbeatSyncProcessor = HeartbeatSyncProcessor = HeartbeatSyncProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('learning-tracking'),
    __param(0, (0, common_2.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [ioredis_1.Redis,
        lesson_progress_repository_1.LessonProgressRepository,
        lessons_repository_1.LessonsRepository,
        event_emitter_1.EventEmitter2,
        enrollments_service_1.EnrollmentsService])
], HeartbeatSyncProcessor);
//# sourceMappingURL=heartbeat-sync.processor.js.map