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
var CourseProgressionListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseProgressionListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const mongoose_1 = require("mongoose");
const progress_event_constant_1 = require("../constants/progress-event.constant");
const lesson_progress_repository_1 = require("../repositories/lesson-progress.repository");
const lessons_repository_1 = require("../repositories/lessons.repository");
const course_reviews_repository_1 = require("../repositories/course-reviews.repository");
const notifications_service_1 = require("../../notifications/notifications.service");
let CourseProgressionListener = CourseProgressionListener_1 = class CourseProgressionListener {
    lessonsRepo;
    lessonProgressRepo;
    reviewsRepo;
    notificationsService;
    logger = new common_1.Logger(CourseProgressionListener_1.name);
    constructor(lessonsRepo, lessonProgressRepo, reviewsRepo, notificationsService) {
        this.lessonsRepo = lessonsRepo;
        this.lessonProgressRepo = lessonProgressRepo;
        this.reviewsRepo = reviewsRepo;
        this.notificationsService = notificationsService;
    }
    async handleLessonCompletedForReview(payload) {
        if (!payload.isFirstCompletion)
            return;
        try {
            const totalLessons = await this.lessonsRepo.countLessonsByCourse(payload.courseId);
            if (totalLessons === 0)
                return;
            const completedLessons = await this.lessonProgressRepo.modelInstance
                .countDocuments({
                userId: new mongoose_1.Types.ObjectId(payload.userId),
                courseId: new mongoose_1.Types.ObjectId(payload.courseId),
                isCompleted: true,
            })
                .exec();
            const isExactly3Lessons = completedLessons === 3;
            const isExactly20Percent = completedLessons === Math.ceil(totalLessons * 0.2);
            const isCompletionHook = completedLessons === totalLessons;
            const isEarlyHook = isExactly3Lessons || isExactly20Percent;
            if (!isEarlyHook && !isCompletionHook)
                return;
            const existingReview = await this.reviewsRepo.findOneSafe({
                userId: new mongoose_1.Types.ObjectId(payload.userId),
                courseId: new mongoose_1.Types.ObjectId(payload.courseId),
            }, { select: '_id' });
            if (existingReview)
                return;
            let title = 'Bạn nghĩ sao về khóa học? ⭐';
            let message = 'Bạn đã đi được một chặng đường tuyệt vời. Hãy dành 1 phút chia sẻ cảm nhận để giúp khóa học tốt hơn nhé!';
            let actionType = 'PROMPT_REVIEW_EARLY';
            if (isCompletionHook) {
                title = 'Chúc mừng bạn đã hoàn thành khóa học! 🏆';
                message =
                    'Tuyệt vời! Bạn đã chinh phục 100% nội dung. Đừng quên để lại đánh giá vinh danh nỗ lực này nhé!';
                actionType = 'PROMPT_REVIEW_COMPLETED';
            }
            await this.notificationsService.createAndDispatch({
                receiverId: payload.userId,
                type: 'COURSE',
                title,
                message,
                payload: {
                    action: actionType,
                    courseId: payload.courseId,
                    lessonId: payload.lessonId,
                    url: `/student/courses/${payload.courseId}/review`,
                },
            });
            this.logger.log(`[SSE Bridge] Đã bắn tín hiệu ${actionType} tới User ${payload.userId} cho Course ${payload.courseId}`);
        }
        catch (error) {
            this.logger.error(`[Progression Listener Error] Lỗi khi xử lý Milestone Review: ${error.message}`, error.stack);
        }
    }
};
exports.CourseProgressionListener = CourseProgressionListener;
__decorate([
    (0, event_emitter_1.OnEvent)(progress_event_constant_1.ProgressEventPattern.LESSON_COMPLETED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CourseProgressionListener.prototype, "handleLessonCompletedForReview", null);
exports.CourseProgressionListener = CourseProgressionListener = CourseProgressionListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [lessons_repository_1.LessonsRepository,
        lesson_progress_repository_1.LessonProgressRepository,
        course_reviews_repository_1.CourseReviewsRepository,
        notifications_service_1.NotificationsService])
], CourseProgressionListener);
//# sourceMappingURL=course-progression.listener.js.map