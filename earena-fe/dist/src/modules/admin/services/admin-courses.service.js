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
var AdminCoursesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCoursesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const event_emitter_1 = require("@nestjs/event-emitter");
const courses_repository_1 = require("../../courses/courses.repository");
const courses_service_1 = require("../../courses/courses.service");
const mail_service_1 = require("../../mail/mail.service");
const course_schema_1 = require("../../courses/schemas/course.schema");
const course_event_constant_1 = require("../../courses/constants/course-event.constant");
let AdminCoursesService = AdminCoursesService_1 = class AdminCoursesService {
    coursesRepo;
    coursesService;
    mailService;
    eventEmitter;
    logger = new common_1.Logger(AdminCoursesService_1.name);
    constructor(coursesRepo, coursesService, mailService, eventEmitter) {
        this.coursesRepo = coursesRepo;
        this.coursesService = coursesService;
        this.mailService = mailService;
        this.eventEmitter = eventEmitter;
    }
    async getPendingCourses(payload) {
        const { page, limit } = payload;
        const skip = (page - 1) * limit;
        const filter = { status: course_schema_1.CourseStatus.PENDING_REVIEW };
        const [items, totalItems] = await Promise.all([
            this.coursesRepo.modelInstance.find(filter)
                .select('title slug price teacherId submittedAt')
                .populate('teacherId', 'fullName email avatar')
                .sort({ submittedAt: 1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.coursesRepo.modelInstance.countDocuments(filter)
        ]);
        const mappedItems = items.map(item => ({
            id: item._id.toString(),
            title: item.title,
            slug: item.slug,
            price: item.price,
            teacher: item.teacherId ? {
                id: item.teacherId._id.toString(),
                fullName: item.teacherId.fullName,
                email: item.teacherId.email,
                avatar: item.teacherId.avatar,
            } : null,
            submittedAt: item.submittedAt
        }));
        return {
            items: mappedItems,
            meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) || 1 }
        };
    }
    async getCourseDetailForReview(courseId) {
        if (!mongoose_1.Types.ObjectId.isValid(courseId))
            throw new common_1.BadRequestException('ID không hợp lệ.');
        const curriculum = await this.coursesRepo.getFullCourseCurriculum(courseId, { maskMediaUrls: false });
        if (!curriculum)
            throw new common_1.NotFoundException('Khóa học không tồn tại.');
        return curriculum;
    }
    async approveCourse(payload) {
        const { courseId } = payload;
        const course = await this.coursesRepo.modelInstance
            .findById(courseId)
            .select('status title slug teacherId')
            .populate('teacherId', 'email fullName')
            .lean()
            .exec();
        if (!course)
            throw new common_1.NotFoundException('Khóa học không tồn tại.');
        if (course.status !== course_schema_1.CourseStatus.PENDING_REVIEW) {
            throw new common_1.BadRequestException(`Không thể duyệt. Khóa học đang ở trạng thái: ${course.status}`);
        }
        await this.coursesRepo.updateByIdSafe(courseId, {
            $set: { status: course_schema_1.CourseStatus.PUBLISHED }
        });
        await this.coursesService.clearCourseCache(course.slug);
        const teacher = course.teacherId;
        if (teacher && teacher.email) {
            this.mailService.sendCourseApproval(teacher.email, teacher.fullName, course.title);
        }
        this.eventEmitter.emit(course_event_constant_1.CourseEventPattern.COURSE_APPROVED, {
            courseId: courseId,
            teacherId: teacher._id.toString(),
            courseTitle: course.title,
        });
        return { message: 'Đã duyệt khóa học thành công. Khóa học đã được Public.' };
    }
    async rejectCourse(payload) {
        const { courseId, reason } = payload;
        const course = await this.coursesRepo.modelInstance
            .findById(courseId)
            .select('status title teacherId')
            .populate('teacherId', 'email fullName')
            .lean()
            .exec();
        if (!course)
            throw new common_1.NotFoundException('Khóa học không tồn tại.');
        if (course.status !== course_schema_1.CourseStatus.PENDING_REVIEW) {
            throw new common_1.BadRequestException(`Không thể từ chối. Khóa học đang ở trạng thái: ${course.status}`);
        }
        await this.coursesRepo.updateByIdSafe(courseId, {
            $set: {
                status: course_schema_1.CourseStatus.REJECTED,
                rejectionReason: reason
            }
        });
        const teacher = course.teacherId;
        if (teacher && teacher.email) {
            this.mailService.sendCourseRejection(teacher.email, teacher.fullName, course.title, reason);
        }
        this.eventEmitter.emit(course_event_constant_1.CourseEventPattern.COURSE_REJECTED, {
            courseId: courseId,
            teacherId: teacher._id.toString(),
            courseTitle: course.title,
            reason: reason,
        });
        return { message: 'Đã từ chối khóa học và lưu lại lý do.' };
    }
    async getAllCourses(payload) {
        const { page, limit, search, status, teacherId } = payload;
        if (status === course_schema_1.CourseStatus.DRAFT) {
            return {
                items: [],
                meta: { page, limit, totalItems: 0, totalPages: 1 }
            };
        }
        const skip = (page - 1) * limit;
        const filter = {
            status: { $ne: course_schema_1.CourseStatus.DRAFT }
        };
        if (status)
            filter.status = status;
        if (teacherId && mongoose_1.Types.ObjectId.isValid(teacherId)) {
            filter.teacherId = new mongoose_1.Types.ObjectId(teacherId);
        }
        if (search) {
            const escapedKeyword = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.$or = [
                { title: { $regex: escapedKeyword, $options: 'i' } },
                { slug: { $regex: escapedKeyword, $options: 'i' } }
            ];
        }
        const [items, totalItems] = await Promise.all([
            this.coursesRepo.modelInstance.find(filter)
                .select('title slug price status teacherId createdAt submittedAt')
                .populate('teacherId', 'fullName email avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.coursesRepo.modelInstance.countDocuments(filter)
        ]);
        const mappedItems = items.map((item) => ({
            id: item._id.toString(),
            title: item.title,
            slug: item.slug,
            price: item.price,
            status: item.status,
            teacher: item.teacherId ? {
                id: item.teacherId._id.toString(),
                fullName: item.teacherId.fullName,
                email: item.teacherId.email,
                avatar: item.teacherId.avatar,
            } : null,
            createdAt: item.createdAt,
            submittedAt: item.submittedAt || null
        }));
        return {
            items: mappedItems,
            meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) || 1 }
        };
    }
    async forceTakedownCourse(payload) {
        const { courseId, reason, adminId } = payload;
        const course = await this.coursesRepo.modelInstance
            .findById(courseId)
            .select('status title slug teacherId')
            .populate('teacherId', 'email fullName')
            .lean()
            .exec();
        if (!course)
            throw new common_1.NotFoundException('Khóa học không tồn tại.');
        if (course.status !== course_schema_1.CourseStatus.PUBLISHED) {
            throw new common_1.BadRequestException(`Không thể thực thi. Khóa học này đang ở trạng thái: ${course.status}`);
        }
        const severeReason = `[GỠ KHẨN CẤP BỞI BQT]: ${reason}`;
        await this.coursesRepo.updateByIdSafe(courseId, {
            $set: {
                status: course_schema_1.CourseStatus.REJECTED,
                rejectionReason: severeReason
            }
        });
        await this.coursesService.clearCourseCache(course.slug);
        this.logger.warn(`[AUDIT - TAKEDOWN] Admin_ID: ${adminId} đã gỡ khóa học Course_ID: ${courseId} ("${course.title}") với lý do: ${reason}`);
        const teacher = course.teacherId;
        if (teacher && teacher.email) {
            this.mailService.sendCourseRejection(teacher.email, teacher.fullName, course.title, severeReason);
        }
        this.eventEmitter.emit(course_event_constant_1.CourseEventPattern.COURSE_REJECTED, {
            courseId: courseId,
            teacherId: teacher._id.toString(),
            courseTitle: course.title,
            reason: severeReason,
        });
        return { message: 'Đã gỡ khóa học khỏi hệ thống thành công. Cache đã được xóa.' };
    }
};
exports.AdminCoursesService = AdminCoursesService;
exports.AdminCoursesService = AdminCoursesService = AdminCoursesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [courses_repository_1.CoursesRepository,
        courses_service_1.CoursesService,
        mail_service_1.MailService,
        event_emitter_1.EventEmitter2])
], AdminCoursesService);
//# sourceMappingURL=admin-courses.service.js.map