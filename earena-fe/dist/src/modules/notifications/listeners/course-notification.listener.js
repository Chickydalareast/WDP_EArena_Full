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
var CourseNotificationListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseNotificationListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const notifications_service_1 = require("../notifications.service");
const notification_event_constant_1 = require("../constants/notification-event.constant");
const courses_repository_1 = require("../../courses/courses.repository");
const course_event_constant_1 = require("../../courses/constants/course-event.constant");
const users_repository_1 = require("../../users/users.repository");
const enrollments_repository_1 = require("../../courses/repositories/enrollments.repository");
let CourseNotificationListener = CourseNotificationListener_1 = class CourseNotificationListener {
    notificationsService;
    coursesRepo;
    usersRepo;
    enrollmentsRepo;
    logger = new common_1.Logger(CourseNotificationListener_1.name);
    constructor(notificationsService, coursesRepo, usersRepo, enrollmentsRepo) {
        this.notificationsService = notificationsService;
        this.coursesRepo = coursesRepo;
        this.usersRepo = usersRepo;
        this.enrollmentsRepo = enrollmentsRepo;
    }
    async handleCourseCompleted(payload) {
        try {
            const course = await this.coursesRepo.findByIdSafe(payload.courseId, {
                select: 'title',
            });
            const courseTitle = course ? course.title : 'Khóa học';
            await this.notificationsService.createAndDispatch({
                receiverId: payload.userId,
                type: notification_event_constant_1.NotificationType.COURSE,
                title: 'Hoàn thành khóa học! 🎓',
                message: `Chúc mừng bạn đã xuất sắc hoàn thành "${courseTitle}". Hãy để lại đánh giá nhé!`,
                payload: {
                    courseId: payload.courseId,
                    url: `/student/courses/${payload.courseId}/study`,
                },
            });
        }
        catch (error) {
            this.logger.error(`[Listener Error] COURSE_COMPLETED: ${error.message}`, error.stack);
        }
    }
    async handleCourseApproved(payload) {
        try {
            await this.notificationsService.createAndDispatch({
                receiverId: payload.teacherId,
                type: notification_event_constant_1.NotificationType.SYSTEM,
                title: 'Khóa học đã được duyệt! 🎉',
                message: `Khóa học "${payload.courseTitle}" của bạn đã được Admin phê duyệt và xuất bản.`,
                payload: {
                    courseId: payload.courseId,
                    url: `/teacher/courses/${payload.courseId}/settings`,
                },
            });
        }
        catch (error) {
            this.logger.error(`[Listener Error] COURSE_APPROVED: ${error.message}`, error.stack);
        }
    }
    async handleCourseRejected(payload) {
        try {
            await this.notificationsService.createAndDispatch({
                receiverId: payload.teacherId,
                type: notification_event_constant_1.NotificationType.SYSTEM,
                title: 'Khóa học bị từ chối phê duyệt ❌',
                message: `Khóa học "${payload.courseTitle}" cần được chỉnh sửa. Lý do: ${payload.reason}`,
                payload: {
                    courseId: payload.courseId,
                    url: `/teacher/courses/${payload.courseId}/builder`,
                },
            });
        }
        catch (error) {
            this.logger.error(`[Listener Error] COURSE_REJECTED: ${error.message}`, error.stack);
        }
    }
    async handleCourseReviewed(payload) {
        try {
            await this.notificationsService.createAndDispatch({
                receiverId: payload.teacherId,
                type: notification_event_constant_1.NotificationType.COURSE,
                title: 'Có đánh giá mới! ⭐',
                message: `Khóa học "${payload.courseTitle}" vừa nhận được đánh giá ${payload.rating} sao từ học viên.`,
                payload: {
                    courseId: payload.courseId,
                    url: `/teacher/courses/${payload.courseId}/settings`,
                },
            });
        }
        catch (error) {
            this.logger.error(`[Listener Error] COURSE_REVIEWED: ${error.message}`, error.stack);
        }
    }
    async handleReviewReplied(payload) {
        try {
            await this.notificationsService.createAndDispatch({
                receiverId: payload.studentId,
                type: notification_event_constant_1.NotificationType.COURSE,
                title: 'Giáo viên đã phản hồi 💬',
                message: `Giáo viên vừa phản hồi đánh giá của bạn trong khóa học "${payload.courseTitle}".`,
                payload: {
                    courseId: payload.courseId,
                    url: `/student/courses/${payload.courseId}/study`,
                },
            });
        }
        catch (error) {
            this.logger.error(`[Listener Error] REVIEW_REPLIED: ${error.message}`, error.stack);
        }
    }
    async handleCoursePurchased(payload) {
        try {
            await this.notificationsService.createAndDispatch({
                receiverId: payload.userId,
                type: notification_event_constant_1.NotificationType.COURSE,
                title: 'Ghi danh thành công! 🚀',
                message: `Bạn đã mua thành công khóa học "${payload.courseTitle}". Bắt đầu hành trình học tập ngay thôi!`,
                payload: {
                    courseId: payload.courseId,
                    url: `/student/courses/${payload.courseId}/study`,
                },
            });
        }
        catch (error) {
            this.logger.error(`[Listener Error] COURSE_PURCHASED: ${error.message}`, error.stack);
        }
    }
    async handleCourseSold(payload) {
        try {
            const student = await this.usersRepo.findByIdSafe(payload.studentId, {
                select: 'fullName',
            });
            const studentName = student ? student.fullName : 'Một học viên';
            const amountFormatted = payload.revenueAmount.toLocaleString('vi-VN');
            await this.notificationsService.createAndDispatch({
                receiverId: payload.teacherId,
                type: notification_event_constant_1.NotificationType.FINANCE,
                title: 'Có người mua khóa học! 💰',
                message: `Học viên ${studentName} vừa đăng ký khóa học "${payload.courseTitle}". Bạn nhận được ${amountFormatted} Coin doanh thu.`,
                payload: { courseId: payload.courseId, url: `/teacher/wallet` },
            });
        }
        catch (error) {
            this.logger.error(`[Listener Error] COURSE_SOLD: ${error.message}`, error.stack);
        }
    }
    async handleCourseNewLesson(payload) {
        try {
            const studentIds = await this.enrollmentsRepo.findActiveStudentIdsByCourse(payload.courseId);
            if (!studentIds || studentIds.length === 0)
                return;
            const CHUNK_SIZE = 500;
            for (let i = 0; i < studentIds.length; i += CHUNK_SIZE) {
                const chunk = studentIds.slice(i, i + CHUNK_SIZE);
                await Promise.all(chunk.map((studentId) => this.notificationsService.createAndDispatch({
                    receiverId: studentId,
                    type: notification_event_constant_1.NotificationType.COURSE,
                    title: 'Bài học mới! 📚',
                    message: `Khóa học "${payload.courseTitle}" vừa có thêm bài học mới: "${payload.lessonTitle}". Vào xem ngay!`,
                    payload: {
                        courseId: payload.courseId,
                        lessonId: payload.lessonId,
                        url: `/student/courses/${payload.courseId}/study?lessonId=${payload.lessonId}`,
                    },
                })));
            }
        }
        catch (error) {
            this.logger.error(`[Listener Error] COURSE_NEW_LESSON: ${error.message}`, error.stack);
        }
    }
};
exports.CourseNotificationListener = CourseNotificationListener;
__decorate([
    (0, event_emitter_1.OnEvent)(course_event_constant_1.CourseEventPattern.COURSE_COMPLETED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CourseNotificationListener.prototype, "handleCourseCompleted", null);
__decorate([
    (0, event_emitter_1.OnEvent)(course_event_constant_1.CourseEventPattern.COURSE_APPROVED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CourseNotificationListener.prototype, "handleCourseApproved", null);
__decorate([
    (0, event_emitter_1.OnEvent)(course_event_constant_1.CourseEventPattern.COURSE_REJECTED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CourseNotificationListener.prototype, "handleCourseRejected", null);
__decorate([
    (0, event_emitter_1.OnEvent)(course_event_constant_1.CourseEventPattern.COURSE_REVIEWED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CourseNotificationListener.prototype, "handleCourseReviewed", null);
__decorate([
    (0, event_emitter_1.OnEvent)(course_event_constant_1.CourseEventPattern.REVIEW_REPLIED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CourseNotificationListener.prototype, "handleReviewReplied", null);
__decorate([
    (0, event_emitter_1.OnEvent)(course_event_constant_1.CourseEventPattern.COURSE_PURCHASED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CourseNotificationListener.prototype, "handleCoursePurchased", null);
__decorate([
    (0, event_emitter_1.OnEvent)(course_event_constant_1.CourseEventPattern.COURSE_SOLD, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CourseNotificationListener.prototype, "handleCourseSold", null);
__decorate([
    (0, event_emitter_1.OnEvent)(course_event_constant_1.CourseEventPattern.COURSE_NEW_LESSON, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CourseNotificationListener.prototype, "handleCourseNewLesson", null);
exports.CourseNotificationListener = CourseNotificationListener = CourseNotificationListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        courses_repository_1.CoursesRepository,
        users_repository_1.UsersRepository,
        enrollments_repository_1.EnrollmentsRepository])
], CourseNotificationListener);
//# sourceMappingURL=course-notification.listener.js.map