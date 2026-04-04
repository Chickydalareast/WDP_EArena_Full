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
var CurriculumService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurriculumService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const event_emitter_1 = require("@nestjs/event-emitter");
const courses_repository_1 = require("../courses.repository");
const sections_repository_1 = require("../repositories/sections.repository");
const lessons_repository_1 = require("../repositories/lessons.repository");
const media_repository_1 = require("../../media/media.repository");
const exams_repository_1 = require("../../exams/exams.repository");
const enrollments_repository_1 = require("../repositories/enrollments.repository");
const redis_service_1 = require("../../../common/redis/redis.service");
const media_schema_1 = require("../../media/schemas/media.schema");
const course_schema_1 = require("../schemas/course.schema");
const enrollment_schema_1 = require("../schemas/enrollment.schema");
const course_event_constant_1 = require("../constants/course-event.constant");
const exam_schema_1 = require("../../exams/schemas/exam.schema");
let CurriculumService = CurriculumService_1 = class CurriculumService {
    coursesRepo;
    sectionsRepo;
    lessonsRepo;
    redisService;
    mediaRepo;
    examsRepo;
    eventEmitter;
    enrollmentsRepo;
    logger = new common_1.Logger(CurriculumService_1.name);
    constructor(coursesRepo, sectionsRepo, lessonsRepo, redisService, mediaRepo, examsRepo, eventEmitter, enrollmentsRepo) {
        this.coursesRepo = coursesRepo;
        this.sectionsRepo = sectionsRepo;
        this.lessonsRepo = lessonsRepo;
        this.redisService = redisService;
        this.mediaRepo = mediaRepo;
        this.examsRepo = examsRepo;
        this.eventEmitter = eventEmitter;
        this.enrollmentsRepo = enrollmentsRepo;
    }
    async verifyMultipleMediaStrict(mediaIds, teacherId) {
        const validIdsArray = mediaIds.filter((id) => !!id && mongoose_1.Types.ObjectId.isValid(id));
        const uniqueValidIds = Array.from(new Set(validIdsArray));
        if (uniqueValidIds.length === 0)
            return;
        const medias = await this.mediaRepo.modelInstance
            .find({
            _id: { $in: uniqueValidIds.map((id) => new mongoose_1.Types.ObjectId(id)) },
        })
            .lean()
            .select('uploadedBy status originalName')
            .exec();
        if (medias.length !== uniqueValidIds.length) {
            throw new common_1.BadRequestException('Một hoặc nhiều tệp đính kèm không tồn tại trong hệ thống.');
        }
        for (const media of medias) {
            if (media.uploadedBy.toString() !== teacherId) {
                this.logger.warn(`[SECURITY ALERT] User ${teacherId} cố gắng gán Media ${media._id} của người khác vào bài học!`);
                throw new common_1.ForbiddenException(`Tệp tin "${media.originalName}" không thuộc quyền sở hữu của bạn.`);
            }
            if (media.status !== media_schema_1.MediaStatus.READY) {
                throw new common_1.BadRequestException(`Tệp tin "${media.originalName}" đang xử lý hoặc bị lỗi, chưa thể sử dụng.`);
            }
        }
    }
    async verifyExamStrict(examId, teacherId) {
        if (!examId)
            return;
        if (!mongoose_1.Types.ObjectId.isValid(examId)) {
            throw new common_1.BadRequestException('Định dạng ID Bài kiểm tra không hợp lệ.');
        }
        const exam = await this.examsRepo.findByIdSafe(examId, {
            select: 'teacherId isPublished title',
        });
        if (!exam) {
            throw new common_1.NotFoundException('Không tìm thấy Bài kiểm tra (Exam) trong hệ thống.');
        }
        if (exam.teacherId.toString() !== teacherId) {
            this.logger.warn(`[SECURITY ALERT] User ${teacherId} cố gắng gán Exam ${examId} của người khác vào bài học!`);
            throw new common_1.ForbiddenException(`Bài kiểm tra "${exam.title}" không thuộc quyền sở hữu của bạn.`);
        }
        if (!exam.isPublished) {
            throw new common_1.BadRequestException(`Bài kiểm tra "${exam.title}" đang ở trạng thái Nháp (Draft). Vui lòng Xuất bản đề thi trước khi gắn vào Khóa học.`);
        }
    }
    async validateCourseOwnership(courseId, teacherId) {
        if (!mongoose_1.Types.ObjectId.isValid(courseId))
            throw new common_1.BadRequestException('ID khóa học không hợp lệ.');
        const course = await this.coursesRepo.findByIdSafe(courseId, {
            select: 'teacherId slug status title progressionMode',
        });
        if (!course)
            throw new common_1.NotFoundException('Không tìm thấy khóa học.');
        if (course.teacherId.toString() !== teacherId) {
            throw new common_1.ForbiddenException('Bạn không có quyền chỉnh sửa khóa học này.');
        }
        return course;
    }
    async clearCourseCache(slug) {
        try {
            await this.redisService.del(`course:detail:${slug}`);
            this.logger.debug(`[Cache Invalidation] Đã xóa cache cho course: ${slug}`);
        }
        catch (error) {
            this.logger.error(`[Cache Error] Lỗi khi xóa cache khóa học ${slug}:`, error);
        }
    }
    async checkStructureLock(courseId, actionName) {
        const studentCount = await this.enrollmentsRepo.modelInstance.countDocuments({
            courseId: new mongoose_1.Types.ObjectId(courseId),
            status: enrollment_schema_1.EnrollmentStatus.ACTIVE,
        });
        if (studentCount > 0) {
            throw new common_1.ForbiddenException(`Hành động bị từ chối (${actionName})! Không thể xóa phân mảnh cấu trúc (Chương/Bài học) khi khóa học đã có học viên ghi danh. Nếu cần thay thế, vui lòng dùng chức năng Cập Nhật nội dung bên trong Bài Học.`);
        }
    }
    async processEmbeddedExamConfig(teacherId, subjectId, config, existingExamId) {
        const dynamicConfigData = config.matrixId
            ? { matrixId: config.matrixId }
            : { adHocSections: config.adHocSections };
        if (existingExamId) {
            await this.examsRepo.updateByIdSafe(existingExamId, {
                $set: {
                    title: config.title,
                    totalScore: config.totalScore,
                    dynamicConfig: dynamicConfigData,
                },
            });
            return existingExamId;
        }
        else {
            const newExam = await this.examsRepo.createDocument({
                title: config.title,
                description: 'Bài kiểm tra tạo tự động từ Course Builder',
                teacherId: new mongoose_1.Types.ObjectId(teacherId),
                subjectId: subjectId || new mongoose_1.Types.ObjectId(),
                totalScore: config.totalScore,
                type: exam_schema_1.ExamType.COURSE_QUIZ,
                mode: exam_schema_1.ExamMode.DYNAMIC,
                isPublished: true,
                dynamicConfig: dynamicConfigData,
            });
            this.logger.log(`[Orchestrator] Đã sinh ngầm COURSE_QUIZ ${newExam._id} cho Teacher ${teacherId}`);
            return newExam._id;
        }
    }
    async createSection(payload) {
        const course = await this.validateCourseOwnership(payload.courseId, payload.teacherId);
        const MAX_RETRIES = 3;
        let attempt = 0;
        while (attempt < MAX_RETRIES) {
            try {
                const nextOrder = await this.sectionsRepo.getNextOrder(payload.courseId);
                const sectionData = {
                    courseId: new mongoose_1.Types.ObjectId(payload.courseId),
                    title: payload.title,
                    description: payload.description,
                    order: nextOrder,
                };
                const created = await this.sectionsRepo.createDocument(sectionData);
                await this.clearCourseCache(course.slug);
                const { _id, ...rest } = created;
                return { id: _id.toString(), ...rest };
            }
            catch (error) {
                if (error.code === 11000) {
                    attempt++;
                    continue;
                }
                throw error;
            }
        }
        throw new common_1.ConflictException('Hệ thống đang xử lý nhiều thao tác cùng lúc, vui lòng thử lại.');
    }
    async updateSection(payload) {
        const course = await this.validateCourseOwnership(payload.courseId, payload.teacherId);
        const section = await this.sectionsRepo.findByIdSafe(payload.sectionId);
        if (!section || section.courseId.toString() !== payload.courseId) {
            throw new common_1.NotFoundException('Chương học không tồn tại trong khóa học này.');
        }
        const { courseId, sectionId, teacherId, ...updateData } = payload;
        const updated = await this.sectionsRepo.updateByIdSafe(sectionId, {
            $set: updateData,
        });
        await this.clearCourseCache(course.slug);
        return {
            message: 'Cập nhật chương học thành công',
            id: updated._id.toString(),
            ...updated,
        };
    }
    async deleteSection(courseId, sectionId, teacherId) {
        const course = await this.validateCourseOwnership(courseId, teacherId);
        await this.checkStructureLock(courseId, 'Xóa Chương học');
        if (!mongoose_1.Types.ObjectId.isValid(sectionId))
            throw new common_1.BadRequestException('ID chương học không hợp lệ.');
        const section = await this.sectionsRepo.findByIdSafe(sectionId, {
            select: 'courseId',
        });
        if (!section || section.courseId.toString() !== courseId) {
            throw new common_1.NotFoundException('Chương học không tồn tại trong khóa học này.');
        }
        await this.sectionsRepo.executeInTransaction(async () => {
            await this.lessonsRepo.deleteManySafe({
                sectionId: new mongoose_1.Types.ObjectId(sectionId),
            });
            await this.sectionsRepo.deleteOneSafe({
                _id: new mongoose_1.Types.ObjectId(sectionId),
            });
        });
        await this.clearCourseCache(course.slug);
        return {
            message: 'Đã xóa Chương và toàn bộ Bài học bên trong thành công.',
        };
    }
    async createLesson(payload) {
        if (payload.examId && payload.embeddedExamConfig) {
            throw new common_1.BadRequestException('Xung đột dữ liệu: Không thể vừa chọn Đề thi có sẵn, vừa yêu cầu tạo Đề thi mới.');
        }
        const course = await this.validateCourseOwnership(payload.courseId, payload.teacherId);
        const mediaIdsToCheck = [
            payload.primaryVideoId,
            ...(payload.attachments || []),
        ];
        await this.verifyMultipleMediaStrict(mediaIdsToCheck, payload.teacherId);
        if (payload.examId)
            await this.verifyExamStrict(payload.examId, payload.teacherId);
        const section = await this.sectionsRepo.findByIdSafe(payload.sectionId, {
            select: '_id',
        });
        if (!section)
            throw new common_1.NotFoundException('Không tìm thấy Chương/Phần này.');
        const MAX_RETRIES = 3;
        let attempt = 0;
        while (attempt < MAX_RETRIES) {
            try {
                const createdLesson = await this.lessonsRepo.executeInTransaction(async () => {
                    const nextOrder = await this.lessonsRepo.getNextOrder(payload.sectionId);
                    let finalExamId = payload.examId
                        ? new mongoose_1.Types.ObjectId(payload.examId)
                        : undefined;
                    if (payload.embeddedExamConfig) {
                        finalExamId = await this.processEmbeddedExamConfig(payload.teacherId, course.subjectId, payload.embeddedExamConfig);
                    }
                    const lessonData = {
                        courseId: new mongoose_1.Types.ObjectId(payload.courseId),
                        sectionId: new mongoose_1.Types.ObjectId(payload.sectionId),
                        title: payload.title,
                        order: nextOrder,
                        isFreePreview: payload.isFreePreview,
                        primaryVideoId: payload.primaryVideoId
                            ? new mongoose_1.Types.ObjectId(payload.primaryVideoId)
                            : undefined,
                        attachments: payload.attachments?.map((id) => new mongoose_1.Types.ObjectId(id)) || [],
                        examId: finalExamId,
                        examRules: payload.examRules || null,
                        content: payload.content,
                    };
                    return await this.lessonsRepo.createDocument(lessonData);
                });
                await this.clearCourseCache(course.slug);
                const { _id, ...rest } = createdLesson;
                const lessonIdStr = _id.toString();
                if (course.status === course_schema_1.CourseStatus.PUBLISHED) {
                    this.eventEmitter.emit(course_event_constant_1.CourseEventPattern.COURSE_NEW_LESSON, {
                        courseId: course._id.toString(),
                        courseTitle: course.title,
                        lessonId: lessonIdStr,
                        lessonTitle: payload.title,
                    });
                }
                return { id: lessonIdStr, ...rest };
            }
            catch (error) {
                if (error.code === 11000) {
                    attempt++;
                    continue;
                }
                throw error;
            }
        }
        throw new common_1.ConflictException('Hệ thống đang xử lý nhiều thao tác cùng lúc, vui lòng thử lại.');
    }
    async updateLesson(payload) {
        if (payload.examId && payload.embeddedExamConfig) {
            throw new common_1.BadRequestException('Xung đột dữ liệu: Không thể truyền cả ID đề thi và cấu hình khởi tạo ngầm.');
        }
        const course = await this.validateCourseOwnership(payload.courseId, payload.teacherId);
        const lesson = await this.lessonsRepo.findByIdSafe(payload.lessonId, {
            populate: 'examId',
        });
        if (!lesson || lesson.courseId.toString() !== payload.courseId) {
            throw new common_1.NotFoundException('Bài học không tồn tại trong khóa học này.');
        }
        const mediaIdsToCheck = [
            payload.primaryVideoId,
            ...(payload.attachments || []),
        ];
        await this.verifyMultipleMediaStrict(mediaIdsToCheck, payload.teacherId);
        if (payload.examId)
            await this.verifyExamStrict(payload.examId, payload.teacherId);
        const updatedLesson = await this.lessonsRepo.executeInTransaction(async () => {
            let finalExamId = undefined;
            if (payload.examId === null && !payload.embeddedExamConfig) {
                finalExamId = null;
            }
            else if (payload.examId) {
                finalExamId = new mongoose_1.Types.ObjectId(payload.examId);
            }
            else if (payload.embeddedExamConfig) {
                const currentExam = lesson.examId;
                const existingQuizId = currentExam && currentExam.type === exam_schema_1.ExamType.COURSE_QUIZ
                    ? currentExam._id
                    : undefined;
                finalExamId = await this.processEmbeddedExamConfig(payload.teacherId, course.subjectId, payload.embeddedExamConfig, existingQuizId);
            }
            const sanitized = {};
            if (payload.title !== undefined)
                sanitized.title = payload.title;
            if (payload.isFreePreview !== undefined)
                sanitized.isFreePreview = payload.isFreePreview;
            if (payload.content !== undefined)
                sanitized.content = payload.content;
            if (payload.primaryVideoId !== undefined)
                sanitized.primaryVideoId = payload.primaryVideoId
                    ? new mongoose_1.Types.ObjectId(payload.primaryVideoId)
                    : null;
            if (payload.attachments !== undefined)
                sanitized.attachments =
                    payload.attachments?.map((id) => new mongoose_1.Types.ObjectId(id)) || [];
            if (payload.examRules !== undefined)
                sanitized.examRules = payload.examRules;
            if (finalExamId !== undefined)
                sanitized.examId = finalExamId;
            return await this.lessonsRepo.updateByIdSafe(payload.lessonId, {
                $set: sanitized,
            });
        });
        await this.clearCourseCache(course.slug);
        return { id: updatedLesson._id.toString(), ...updatedLesson };
    }
    async deleteLesson(courseId, lessonId, teacherId) {
        const course = await this.validateCourseOwnership(courseId, teacherId);
        await this.checkStructureLock(courseId, 'Xóa Bài học');
        const lesson = await this.lessonsRepo.findByIdSafe(lessonId, {
            populate: 'examId',
        });
        if (!lesson || lesson.courseId.toString() !== courseId)
            throw new common_1.NotFoundException('Bài học không hợp lệ.');
        const examObj = lesson.examId;
        await this.lessonsRepo.executeInTransaction(async () => {
            await this.lessonsRepo.deleteOneSafe({
                _id: new mongoose_1.Types.ObjectId(lessonId),
            });
            if (examObj && examObj.type === exam_schema_1.ExamType.COURSE_QUIZ) {
                await this.examsRepo.deleteOneSafe({ _id: examObj._id });
                this.logger.log(`[Garbage Collection] Xóa thành công đề ngầm ${examObj._id} đi kèm bài học ${lessonId}`);
            }
        });
        await this.clearCourseCache(course.slug);
        return { message: 'Đã xóa bài học và các tài nguyên ngầm liên quan.' };
    }
    async reorderCurriculum(payload) {
        const course = await this.validateCourseOwnership(payload.courseId, payload.teacherId);
        if (course.progressionMode === 'STRICT_LINEAR') {
            const studentCount = await this.enrollmentsRepo.modelInstance.countDocuments({
                courseId: new mongoose_1.Types.ObjectId(payload.courseId),
                status: enrollment_schema_1.EnrollmentStatus.ACTIVE,
            });
            if (studentCount > 0) {
                throw new common_1.ForbiddenException('Không thể thay đổi thứ tự bài học (Reorder) do khóa học đang bật cấu hình học Tuần tự (STRICT_LINEAR) và đã có học viên. Việc đảo lộn thứ tự sẽ gây gãy hệ thống tính toán bài học tiếp theo.');
            }
        }
        await this.coursesRepo.executeInTransaction(async () => {
            if (payload.sections && payload.sections.length > 0) {
                await this.sectionsRepo.bulkUpdateOrderStrict(payload.courseId, payload.sections);
            }
            if (payload.lessons && payload.lessons.length > 0) {
                await this.lessonsRepo.bulkUpdateOrderAndSectionStrict(payload.courseId, payload.lessons);
            }
        });
        await this.clearCourseCache(course.slug);
        return { message: 'Cập nhật cấu trúc bài giảng thành công.' };
    }
};
exports.CurriculumService = CurriculumService;
exports.CurriculumService = CurriculumService = CurriculumService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [courses_repository_1.CoursesRepository,
        sections_repository_1.SectionsRepository,
        lessons_repository_1.LessonsRepository,
        redis_service_1.RedisService,
        media_repository_1.MediaRepository,
        exams_repository_1.ExamsRepository,
        event_emitter_1.EventEmitter2,
        enrollments_repository_1.EnrollmentsRepository])
], CurriculumService);
//# sourceMappingURL=curriculum.service.js.map