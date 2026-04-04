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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const event_emitter_1 = require("@nestjs/event-emitter");
const enrollments_repository_1 = require("../repositories/enrollments.repository");
const lessons_repository_1 = require("../repositories/lessons.repository");
const courses_repository_1 = require("../courses.repository");
const course_event_constant_1 = require("../constants/course-event.constant");
let EnrollmentsService = class EnrollmentsService {
    enrollmentsRepo;
    lessonsRepo;
    coursesRepo;
    eventEmitter;
    constructor(enrollmentsRepo, lessonsRepo, coursesRepo, eventEmitter) {
        this.enrollmentsRepo = enrollmentsRepo;
        this.lessonsRepo = lessonsRepo;
        this.coursesRepo = coursesRepo;
        this.eventEmitter = eventEmitter;
    }
    async validateCourseExamAccess(userId, courseId, examId) {
        if (!mongoose_1.Types.ObjectId.isValid(courseId) || !mongoose_1.Types.ObjectId.isValid(examId)) {
            throw new common_1.BadRequestException('ID khóa học hoặc bài thi không hợp lệ.');
        }
        const lesson = await this.lessonsRepo.findOneSafe({
            courseId: new mongoose_1.Types.ObjectId(courseId),
            examId: new mongoose_1.Types.ObjectId(examId),
        }, { select: 'isFreePreview' });
        if (!lesson) {
            throw new common_1.ForbiddenException('Phát hiện truy cập trái phép! Bài thi không thuộc khóa học này.');
        }
        if (lesson.isFreePreview)
            return true;
        const course = await this.coursesRepo.findByIdSafe(courseId, {
            select: 'teacherId',
        });
        if (course && course.teacherId.toString() === userId)
            return true;
        const enrollment = await this.enrollmentsRepo.findUserEnrollment(userId, courseId);
        if (enrollment && enrollment.status === 'ACTIVE')
            return true;
        throw new common_1.ForbiddenException('Bạn chưa ghi danh khóa học này. Vui lòng nâng cấp để làm bài thi.');
    }
    async createEnrollment(payload) {
        const enrollment = await this.enrollmentsRepo.createDocument({
            userId: new mongoose_1.Types.ObjectId(payload.userId),
            courseId: new mongoose_1.Types.ObjectId(payload.courseId),
            completedLessons: [],
            progress: 0,
        });
        return { id: enrollment._id.toString() };
    }
    async markLessonCompleted(payload) {
        if (!mongoose_1.Types.ObjectId.isValid(payload.courseId) ||
            !mongoose_1.Types.ObjectId.isValid(payload.lessonId)) {
            throw new common_1.BadRequestException('ID không hợp lệ.');
        }
        const enrollment = await this.enrollmentsRepo.findUserEnrollment(payload.userId, payload.courseId);
        if (!enrollment)
            throw new common_1.ForbiddenException('Bạn chưa ghi danh khóa học này.');
        const lessonObjectId = new mongoose_1.Types.ObjectId(payload.lessonId);
        const isAlreadyCompleted = enrollment.completedLessons.some((id) => id.toString() === lessonObjectId.toString());
        if (isAlreadyCompleted)
            return {
                message: 'Bài học đã được hoàn thành trước đó.',
                progress: enrollment.progress,
            };
        const totalLessons = await this.lessonsRepo.countLessonsByCourse(payload.courseId);
        if (totalLessons === 0)
            return { message: 'Khóa học chưa có bài học nào.', progress: 0 };
        const newCompletedCount = enrollment.completedLessons.length + 1;
        let newProgress = Math.floor((newCompletedCount / totalLessons) * 100);
        newProgress = Math.min(newProgress, 100);
        const updated = await this.enrollmentsRepo.atomicUpdateProgress(enrollment._id, lessonObjectId, newProgress);
        const finalProgress = updated?.progress || newProgress;
        if (finalProgress === 100 && enrollment.progress < 100) {
            this.eventEmitter.emit(course_event_constant_1.CourseEventPattern.COURSE_COMPLETED, {
                userId: payload.userId,
                courseId: payload.courseId,
            });
        }
        return {
            message: 'Đã lưu tiến độ học tập.',
            progress: finalProgress,
        };
    }
};
exports.EnrollmentsService = EnrollmentsService;
exports.EnrollmentsService = EnrollmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [enrollments_repository_1.EnrollmentsRepository,
        lessons_repository_1.LessonsRepository,
        courses_repository_1.CoursesRepository,
        event_emitter_1.EventEmitter2])
], EnrollmentsService);
//# sourceMappingURL=enrollments.service.js.map