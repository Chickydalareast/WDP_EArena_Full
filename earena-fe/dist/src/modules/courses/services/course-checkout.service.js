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
var CourseCheckoutService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseCheckoutService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const event_emitter_1 = require("@nestjs/event-emitter");
const courses_repository_1 = require("../courses.repository");
const enrollments_repository_1 = require("../repositories/enrollments.repository");
const enrollments_service_1 = require("./enrollments.service");
const wallets_service_1 = require("../../wallets/wallets.service");
const course_schema_1 = require("../schemas/course.schema");
const wallet_transaction_schema_1 = require("../../wallets/schemas/wallet-transaction.schema");
const course_event_constant_1 = require("../constants/course-event.constant");
let CourseCheckoutService = CourseCheckoutService_1 = class CourseCheckoutService {
    coursesRepo;
    enrollmentsRepo;
    enrollmentsService;
    walletsService;
    eventEmitter;
    logger = new common_1.Logger(CourseCheckoutService_1.name);
    constructor(coursesRepo, enrollmentsRepo, enrollmentsService, walletsService, eventEmitter) {
        this.coursesRepo = coursesRepo;
        this.enrollmentsRepo = enrollmentsRepo;
        this.enrollmentsService = enrollmentsService;
        this.walletsService = walletsService;
        this.eventEmitter = eventEmitter;
    }
    async checkoutCourse(payload) {
        if (!mongoose_1.Types.ObjectId.isValid(payload.courseId)) {
            throw new common_1.BadRequestException('Mã khóa học không hợp lệ.');
        }
        const course = await this.coursesRepo.findByIdSafe(payload.courseId, {
            select: 'status price title teacherId',
        });
        if (!course)
            throw new common_1.NotFoundException('Khóa học không tồn tại.');
        if (course.status !== course_schema_1.CourseStatus.PUBLISHED)
            throw new common_1.BadRequestException('Khóa học chưa được xuất bản.');
        if (course.teacherId.toString() === payload.userId)
            throw new common_1.BadRequestException('Giáo viên không thể tự mua khóa học của mình.');
        let revenueEarned = 0;
        const transactionResult = await this.coursesRepo.executeInTransaction(async () => {
            const existing = await this.enrollmentsRepo.findUserEnrollment(payload.userId, payload.courseId);
            if (existing)
                throw new common_1.ConflictException('Bạn đã ghi danh khóa học này rồi.');
            if (course.price && course.price > 0) {
                const paymentResult = await this.walletsService.processSplitPayment({
                    buyerId: payload.userId,
                    sellerId: course.teacherId.toString(),
                    amount: course.price,
                    referenceId: course._id,
                    referenceType: wallet_transaction_schema_1.ReferenceType.COURSE,
                    description: `Thanh toán khóa học: ${course.title}`,
                });
                revenueEarned = paymentResult.revenueAmount;
            }
            const enrollment = await this.enrollmentsService.createEnrollment({
                userId: payload.userId,
                courseId: payload.courseId,
            });
            return {
                message: course.price && course.price > 0
                    ? 'Thanh toán và ghi danh khóa học thành công.'
                    : 'Ghi danh khóa học miễn phí thành công.',
                enrollmentId: enrollment.id,
            };
        });
        this.eventEmitter.emit(course_event_constant_1.CourseEventPattern.COURSE_PURCHASED, {
            userId: payload.userId,
            courseId: payload.courseId,
            courseTitle: course.title,
        });
        if (course.price && course.price > 0) {
            this.eventEmitter.emit(course_event_constant_1.CourseEventPattern.COURSE_SOLD, {
                teacherId: course.teacherId.toString(),
                studentId: payload.userId,
                courseId: payload.courseId,
                courseTitle: course.title,
                revenueAmount: revenueEarned,
            });
        }
        return transactionResult;
    }
};
exports.CourseCheckoutService = CourseCheckoutService;
exports.CourseCheckoutService = CourseCheckoutService = CourseCheckoutService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [courses_repository_1.CoursesRepository,
        enrollments_repository_1.EnrollmentsRepository,
        enrollments_service_1.EnrollmentsService,
        wallets_service_1.WalletsService,
        event_emitter_1.EventEmitter2])
], CourseCheckoutService);
//# sourceMappingURL=course-checkout.service.js.map