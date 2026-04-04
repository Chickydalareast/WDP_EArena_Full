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
var CourseReviewsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseReviewsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const event_emitter_1 = require("@nestjs/event-emitter");
const courses_repository_1 = require("../courses.repository");
const enrollments_repository_1 = require("../repositories/enrollments.repository");
const course_reviews_repository_1 = require("../repositories/course-reviews.repository");
const redis_service_1 = require("../../../common/redis/redis.service");
const course_schema_1 = require("../schemas/course.schema");
const enrollment_schema_1 = require("../schemas/enrollment.schema");
const course_event_constant_1 = require("../constants/course-event.constant");
let CourseReviewsService = CourseReviewsService_1 = class CourseReviewsService {
    coursesRepo;
    enrollmentsRepo;
    reviewsRepo;
    redisService;
    eventEmitter;
    logger = new common_1.Logger(CourseReviewsService_1.name);
    constructor(coursesRepo, enrollmentsRepo, reviewsRepo, redisService, eventEmitter) {
        this.coursesRepo = coursesRepo;
        this.enrollmentsRepo = enrollmentsRepo;
        this.reviewsRepo = reviewsRepo;
        this.redisService = redisService;
        this.eventEmitter = eventEmitter;
    }
    async clearCourseCache(slug) {
        try {
            await this.redisService.del(`course:detail:${slug}`);
            const redisClient = this.redisService.redisClient ||
                this.redisService.redis;
            if (redisClient) {
                const keys = await redisClient.keys('courses:public:*');
                if (keys.length > 0)
                    await redisClient.del(...keys);
            }
        }
        catch (error) {
            this.logger.error(`[Cache Error] Lỗi khi xóa cache khóa học ${slug}:`, error);
        }
    }
    async createReview(payload) {
        if (!mongoose_1.Types.ObjectId.isValid(payload.courseId)) {
            throw new common_1.BadRequestException('ID khóa học không hợp lệ.');
        }
        const course = await this.coursesRepo.findByIdSafe(payload.courseId, {
            select: 'status slug teacherId title',
        });
        if (!course || course.status !== course_schema_1.CourseStatus.PUBLISHED) {
            throw new common_1.NotFoundException('Khóa học không tồn tại hoặc chưa xuất bản.');
        }
        const enrollment = await this.enrollmentsRepo.findUserEnrollment(payload.userId, payload.courseId);
        if (!enrollment || enrollment.status !== enrollment_schema_1.EnrollmentStatus.ACTIVE) {
            throw new common_1.ForbiddenException('Bạn phải ghi danh khóa học này trước khi để lại đánh giá.');
        }
        if (enrollment.progress === 0) {
            throw new common_1.ForbiddenException('Bạn cần trải nghiệm ít nhất một bài học (progress > 0%) trước khi đưa ra đánh giá.');
        }
        const statsResult = await this.coursesRepo.executeInTransaction(async () => {
            try {
                await this.reviewsRepo.createDocument({
                    courseId: new mongoose_1.Types.ObjectId(payload.courseId),
                    userId: new mongoose_1.Types.ObjectId(payload.userId),
                    rating: payload.rating,
                    comment: payload.comment,
                });
            }
            catch (error) {
                if (error.code === 11000) {
                    throw new common_1.BadRequestException('Bạn đã gửi đánh giá cho khóa học này rồi. Không thể đánh giá thêm.');
                }
                throw error;
            }
            const stats = await this.reviewsRepo.calculateAverageRating(payload.courseId);
            await this.coursesRepo.updateByIdSafe(payload.courseId, {
                $set: {
                    averageRating: stats.averageRating,
                    totalReviews: stats.totalReviews,
                },
            });
            return stats;
        });
        await this.clearCourseCache(course.slug);
        this.eventEmitter.emit(course_event_constant_1.CourseEventPattern.COURSE_REVIEWED, {
            courseId: payload.courseId,
            teacherId: course.teacherId.toString(),
            studentId: payload.userId,
            courseTitle: course.title,
            rating: payload.rating,
        });
        return {
            message: 'Cảm ơn bạn đã đánh giá khóa học!',
            stats: statsResult,
        };
    }
    async replyReview(payload) {
        if (!mongoose_1.Types.ObjectId.isValid(payload.reviewId)) {
            throw new common_1.BadRequestException('ID bài đánh giá không hợp lệ.');
        }
        const review = await this.reviewsRepo.findByIdSafe(payload.reviewId, {
            select: 'courseId userId',
        });
        if (!review) {
            throw new common_1.NotFoundException('Không tìm thấy bài đánh giá này.');
        }
        const course = await this.coursesRepo.findByIdSafe(review.courseId, {
            select: 'teacherId slug title',
        });
        if (!course) {
            throw new common_1.NotFoundException('Khóa học liên kết với đánh giá không tồn tại.');
        }
        if (course.teacherId.toString() !== payload.teacherId) {
            throw new common_1.ForbiddenException('Bạn không có quyền phản hồi bài đánh giá của khóa học này.');
        }
        await this.reviewsRepo.updateByIdSafe(payload.reviewId, {
            $set: {
                teacherReply: payload.reply,
                repliedAt: new Date(),
            },
        });
        await this.clearCourseCache(course.slug);
        this.eventEmitter.emit(course_event_constant_1.CourseEventPattern.REVIEW_REPLIED, {
            reviewId: payload.reviewId,
            courseId: review.courseId.toString(),
            studentId: review.userId.toString(),
            teacherId: payload.teacherId,
            courseTitle: course.title,
        });
        return {
            message: 'Đã lưu phản hồi của bạn cho học viên này.',
        };
    }
    async getReviews(payload) {
        if (!mongoose_1.Types.ObjectId.isValid(payload.courseId)) {
            throw new common_1.BadRequestException('ID khóa học không hợp lệ.');
        }
        const result = await this.reviewsRepo.getCourseReviewsPaginated(payload.courseId, payload.page, payload.limit);
        return {
            items: result.items,
            meta: {
                totalItems: result.total,
                currentPage: payload.page,
                itemsPerPage: payload.limit,
                totalPages: Math.ceil(result.total / payload.limit) || 1,
            },
        };
    }
};
exports.CourseReviewsService = CourseReviewsService;
exports.CourseReviewsService = CourseReviewsService = CourseReviewsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [courses_repository_1.CoursesRepository,
        enrollments_repository_1.EnrollmentsRepository,
        course_reviews_repository_1.CourseReviewsRepository,
        redis_service_1.RedisService,
        event_emitter_1.EventEmitter2])
], CourseReviewsService);
//# sourceMappingURL=course-reviews.service.js.map