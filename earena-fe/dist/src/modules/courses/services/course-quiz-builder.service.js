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
var CourseQuizBuilderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseQuizBuilderService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const event_emitter_1 = require("@nestjs/event-emitter");
const courses_repository_1 = require("../courses.repository");
const sections_repository_1 = require("../repositories/sections.repository");
const lessons_repository_1 = require("../repositories/lessons.repository");
const enrollments_repository_1 = require("../repositories/enrollments.repository");
const exams_repository_1 = require("../../exams/exams.repository");
const redis_service_1 = require("../../../common/redis/redis.service");
const course_schema_1 = require("../schemas/course.schema");
const enrollment_schema_1 = require("../schemas/enrollment.schema");
const exam_schema_1 = require("../../exams/schemas/exam.schema");
const course_event_constant_1 = require("../constants/course-event.constant");
const exam_generator_service_1 = require("../../exams/exam-generator.service");
const exam_matrices_service_1 = require("../../exams/exam-matrices.service");
const exam_submission_schema_1 = require("../../exams/schemas/exam-submission.schema");
const exam_submissions_repository_1 = require("../../exams/exam-submissions.repository");
const questions_repository_1 = require("../../questions/questions.repository");
const exam_papers_repository_1 = require("../../exams/exam-papers.repository");
let CourseQuizBuilderService = CourseQuizBuilderService_1 = class CourseQuizBuilderService {
    coursesRepo;
    sectionsRepo;
    lessonsRepo;
    examsRepo;
    enrollmentsRepo;
    submissionsRepo;
    questionsRepo;
    examPapersRepo;
    redisService;
    eventEmitter;
    examMatricesService;
    examGeneratorService;
    logger = new common_1.Logger(CourseQuizBuilderService_1.name);
    constructor(coursesRepo, sectionsRepo, lessonsRepo, examsRepo, enrollmentsRepo, submissionsRepo, questionsRepo, examPapersRepo, redisService, eventEmitter, examMatricesService, examGeneratorService) {
        this.coursesRepo = coursesRepo;
        this.sectionsRepo = sectionsRepo;
        this.lessonsRepo = lessonsRepo;
        this.examsRepo = examsRepo;
        this.enrollmentsRepo = enrollmentsRepo;
        this.submissionsRepo = submissionsRepo;
        this.questionsRepo = questionsRepo;
        this.examPapersRepo = examPapersRepo;
        this.redisService = redisService;
        this.eventEmitter = eventEmitter;
        this.examMatricesService = examMatricesService;
        this.examGeneratorService = examGeneratorService;
    }
    async validateCourseOwnership(courseId, teacherId) {
        const course = await this.coursesRepo.findByIdSafe(new mongoose_1.Types.ObjectId(courseId), { select: 'teacherId slug status subjectId title' });
        if (!course)
            throw new common_1.NotFoundException('Không tìm thấy khóa học.');
        if (course.teacherId.toString() !== teacherId) {
            throw new common_1.ForbiddenException('Bạn không có quyền chỉnh sửa khóa học này.');
        }
        return course;
    }
    async checkStructureLock(courseId, actionName) {
        const studentCount = await this.enrollmentsRepo.modelInstance.countDocuments({
            courseId: new mongoose_1.Types.ObjectId(courseId),
            status: enrollment_schema_1.EnrollmentStatus.ACTIVE,
        });
        if (studentCount > 0) {
            throw new common_1.ForbiddenException(`Hành động bị từ chối (${actionName})! Không thể xóa Bài học khi khóa học đã có học viên ghi danh, nhằm bảo vệ toàn vẹn lịch sử học tập.`);
        }
    }
    async createUnifiedQuizLesson(params) {
        const { teacherId, courseId, sectionId, title, content, isFreePreview, totalScore, dynamicConfig, examRules, } = params;
        const courseObjId = new mongoose_1.Types.ObjectId(courseId);
        const teacherObjId = new mongoose_1.Types.ObjectId(teacherId);
        const course = await this.coursesRepo.findByIdSafe(courseObjId, {
            select: 'teacherId slug status subjectId title',
        });
        if (!course)
            throw new common_1.NotFoundException('Không tìm thấy khóa học.');
        if (course.teacherId.toString() !== teacherId) {
            throw new common_1.ForbiddenException('Bạn không có quyền chỉnh sửa khóa học này.');
        }
        if (!course.subjectId) {
            throw new common_1.BadRequestException('Khóa học chưa được thiết lập Môn học (Subject). Vui lòng cập nhật khóa học trước khi tạo Quiz.');
        }
        const section = await this.sectionsRepo.findByIdSafe(new mongoose_1.Types.ObjectId(sectionId), { select: '_id courseId' });
        if (!section || section.courseId.toString() !== courseId) {
            throw new common_1.NotFoundException('Không tìm thấy Chương/Phần này trong khóa học.');
        }
        const MAX_RETRIES = 3;
        let attempt = 0;
        while (attempt < MAX_RETRIES) {
            try {
                const createdLesson = await this.lessonsRepo.executeInTransaction(async () => {
                    const newExam = await this.examsRepo.createDocument({
                        title: `Quiz: ${title} (Course Builder)`,
                        description: `Auto-generated unified quiz for course ${courseId}`,
                        teacherId: teacherObjId,
                        subjectId: course.subjectId,
                        totalScore: totalScore,
                        isPublished: true,
                        type: exam_schema_1.ExamType.COURSE_QUIZ,
                        mode: exam_schema_1.ExamMode.DYNAMIC,
                        dynamicConfig: dynamicConfig,
                    });
                    const nextOrder = await this.lessonsRepo.getNextOrder(new mongoose_1.Types.ObjectId(sectionId));
                    return await this.lessonsRepo.createDocument({
                        courseId: courseObjId,
                        sectionId: new mongoose_1.Types.ObjectId(sectionId),
                        title: title,
                        content: content,
                        order: nextOrder,
                        isFreePreview: isFreePreview,
                        examId: newExam._id,
                        examRules: examRules,
                        attachments: [],
                    });
                });
                await this.redisService.del(`course:detail:${course.slug}`);
                this.logger.debug(`[Unified Builder] Đã xóa cache cho course: ${course.slug}`);
                const { _id, ...rest } = createdLesson;
                const lessonIdStr = _id.toString();
                if (course.status === course_schema_1.CourseStatus.PUBLISHED) {
                    this.eventEmitter.emit(course_event_constant_1.CourseEventPattern.COURSE_NEW_LESSON, {
                        courseId: course._id.toString(),
                        courseTitle: course.title,
                        lessonId: lessonIdStr,
                        lessonTitle: title,
                    });
                }
                return { id: lessonIdStr, ...rest };
            }
            catch (error) {
                if (error.code === 11000) {
                    attempt++;
                    this.logger.warn(`[Unified Builder] Race condition detected on order index. Retrying ${attempt}/${MAX_RETRIES}...`);
                    continue;
                }
                throw error;
            }
        }
        throw new common_1.ConflictException('Hệ thống đang xử lý cấu trúc bài giảng. Vui lòng thử lại sau.');
    }
    async deleteUnifiedQuizLesson(params) {
        const { teacherId, courseId, lessonId } = params;
        const course = await this.validateCourseOwnership(courseId, teacherId);
        await this.checkStructureLock(courseId, 'Xóa Quiz Lesson');
        const lesson = await this.lessonsRepo.findByIdSafe(new mongoose_1.Types.ObjectId(lessonId), { select: 'courseId examId' });
        if (!lesson || lesson.courseId.toString() !== courseId) {
            throw new common_1.NotFoundException('Bài học không hợp lệ hoặc đã bị xóa.');
        }
        await this.lessonsRepo.executeInTransaction(async () => {
            await this.lessonsRepo.deleteOneSafe({
                _id: new mongoose_1.Types.ObjectId(lessonId),
            });
            if (lesson.examId) {
                await this.examsRepo.deleteOneSafe({ _id: lesson.examId });
                this.logger.log(`[Unified Builder] Đã xóa (cascade) Exam ngầm ${lesson.examId} cùng với Lesson ${lessonId}.`);
            }
        });
        await this.redisService.del(`course:detail:${course.slug}`);
    }
    async getMatricesByCourseSubject(params) {
        const { teacherId, courseId, page, limit, search } = params;
        const course = await this.coursesRepo.findByIdSafe(new mongoose_1.Types.ObjectId(courseId), { select: 'teacherId subjectId' });
        if (!course)
            throw new common_1.NotFoundException('Không tìm thấy khóa học.');
        if (course.teacherId.toString() !== teacherId) {
            throw new common_1.ForbiddenException('Bạn không có quyền truy cập khóa học này.');
        }
        if (!course.subjectId) {
            throw new common_1.BadRequestException('Khóa học chưa được thiết lập Môn học (Subject). ' +
                'Vui lòng cập nhật khóa học trước khi tìm Khuôn mẫu Ma trận.');
        }
        return this.examMatricesService.getMatrices(teacherId, {
            page,
            limit,
            subjectId: course.subjectId.toString(),
            search,
        });
    }
    async getAvailableCountForRule(params) {
        const availableCount = await this.examGeneratorService.countAvailableForRule(params.teacherId, {
            folderIds: params.folderIds,
            topicIds: params.topicIds,
            difficulties: params.difficulties,
            tags: params.tags,
            limit: params.limit,
        });
        const safetyRatio = params.limit > 0
            ? parseFloat((availableCount / params.limit).toFixed(2))
            : 0;
        return {
            availableCount,
            requiredCount: params.limit,
            isSufficient: availableCount >= params.limit,
            safetyRatio,
        };
    }
    async previewQuizConfig(params) {
        const rateLimitKey = `ratelimit:quiz-preview:${params.teacherId}`;
        const isAllowed = await this.redisService.setNx(rateLimitKey, '1', 10);
        if (!isAllowed) {
            throw new common_1.BadRequestException('Bạn đang gửi yêu cầu xem trước quá nhanh. Vui lòng chờ 10 giây và thử lại.');
        }
        return this.examGeneratorService.previewDynamicExam({
            teacherId: params.teacherId,
            matrixId: params.matrixId,
            adHocSections: params.adHocSections,
        });
    }
    async updateUnifiedQuizLesson(params) {
        const { teacherId, courseId, lessonId, title, content, isFreePreview, totalScore, dynamicConfig, examRules, } = params;
        const course = await this.validateCourseOwnership(courseId, teacherId);
        const lesson = await this.lessonsRepo.findByIdSafe(new mongoose_1.Types.ObjectId(lessonId));
        if (!lesson || lesson.courseId.toString() !== courseId) {
            throw new common_1.NotFoundException('Bài học không tồn tại trong khóa học này.');
        }
        if (!lesson.examId) {
            throw new common_1.BadRequestException('Bài học này không phải là định dạng Quiz.');
        }
        if (dynamicConfig !== undefined) {
            const completedSubmissionsCount = await this.submissionsRepo.modelInstance.countDocuments({
                lessonId: new mongoose_1.Types.ObjectId(lessonId),
                status: exam_submission_schema_1.SubmissionStatus.COMPLETED,
            });
            if (completedSubmissionsCount > 0) {
                throw new common_1.ConflictException(`Không thể thay đổi cấu hình bốc đề (dynamicConfig) vì đã có ${completedSubmissionsCount} lượt làm bài hoàn thành. ` +
                    `Thay đổi này sẽ phá vỡ tính nhất quán dữ liệu học tập. ` +
                    `Chỉ có thể cập nhật tiêu đề, nội dung và quy tắc thi.`);
            }
        }
        const lessonUpdatePayload = {};
        if (title !== undefined)
            lessonUpdatePayload.title = title;
        if (content !== undefined)
            lessonUpdatePayload.content = content;
        if (isFreePreview !== undefined)
            lessonUpdatePayload.isFreePreview = isFreePreview;
        if (examRules !== undefined)
            lessonUpdatePayload.examRules = examRules;
        const examUpdatePayload = {};
        if (title !== undefined)
            examUpdatePayload.title = `Quiz: ${title} (Course Builder)`;
        if (totalScore !== undefined)
            examUpdatePayload.totalScore = totalScore;
        if (dynamicConfig !== undefined)
            examUpdatePayload.dynamicConfig = dynamicConfig;
        const updatedLesson = await this.lessonsRepo.executeInTransaction(async () => {
            if (Object.keys(examUpdatePayload).length > 0) {
                await this.examsRepo.updateByIdSafe(lesson.examId, {
                    $set: examUpdatePayload,
                });
            }
            if (Object.keys(lessonUpdatePayload).length > 0) {
                return await this.lessonsRepo.updateByIdSafe(new mongoose_1.Types.ObjectId(lessonId), { $set: lessonUpdatePayload });
            }
            return lesson;
        });
        await this.redisService.del(`course:detail:${course.slug}`);
        this.logger.log(`[Unified Builder] Đã cập nhật Quiz Lesson ${lessonId} và Exam ngầm ${lesson.examId}.`);
        return { id: lessonId, ...updatedLesson };
    }
    async getQuizHealth(params) {
        const { teacherId, courseId, lessonId } = params;
        await this.validateCourseOwnership(courseId, teacherId);
        const lesson = await this.lessonsRepo.findByIdSafe(new mongoose_1.Types.ObjectId(lessonId), { populate: 'examId' });
        if (!lesson || lesson.courseId.toString() !== courseId) {
            throw new common_1.NotFoundException('Bài học không tồn tại trong khóa học này.');
        }
        if (!lesson.examId) {
            throw new common_1.BadRequestException('Bài học này không phải là định dạng Quiz.');
        }
        const exam = lesson.examId;
        const completedCount = await this.submissionsRepo.modelInstance.countDocuments({
            lessonId: new mongoose_1.Types.ObjectId(lessonId),
            status: exam_submission_schema_1.SubmissionStatus.COMPLETED
        });
        const isLocked = completedCount > 0;
        if (!exam.dynamicConfig) {
            return {
                lessonId,
                examId: exam._id.toString(),
                isHealthy: false,
                hasWarning: false,
                isLocked,
                matrixExists: null,
                configMode: 'unconfigured',
                rules: [],
            };
        }
        const hasMatrix = !!exam.dynamicConfig.matrixId;
        const hasAdHoc = (exam.dynamicConfig.adHocSections?.length ?? 0) > 0;
        const configMode = hasMatrix
            ? 'matrix'
            : hasAdHoc
                ? 'adHoc'
                : 'unconfigured';
        let matrixExists = null;
        if (hasMatrix) {
            try {
                await this.examMatricesService.getMatrixDetail(exam.dynamicConfig.matrixId.toString(), teacherId);
                matrixExists = true;
            }
            catch {
                matrixExists = false;
            }
        }
        let sectionsToCheck = [];
        if (hasMatrix && matrixExists) {
            const matrixDetail = await this.examMatricesService.getMatrixDetail(exam.dynamicConfig.matrixId.toString(), teacherId);
            sectionsToCheck = matrixDetail.sections;
        }
        else if (hasAdHoc) {
            sectionsToCheck = exam.dynamicConfig.adHocSections;
        }
        const ruleStatusList = [];
        await Promise.all(sectionsToCheck.map(async (section) => {
            const sectionRuleResults = await Promise.all(section.rules.map(async (rule) => {
                const availableCount = await this.examGeneratorService.countAvailableForRule(teacherId, {
                    folderIds: rule.folderIds?.map((id) => id.toString()),
                    topicIds: rule.topicIds?.map((id) => id.toString()),
                    difficulties: rule.difficulties,
                    tags: rule.tags,
                    limit: rule.limit,
                });
                const safetyRatio = rule.limit > 0
                    ? parseFloat((availableCount / rule.limit).toFixed(2))
                    : 0;
                return {
                    sectionName: section.name,
                    requiredCount: rule.limit,
                    availableCount,
                    isSufficient: availableCount >= rule.limit,
                    safetyRatio,
                    isWarning: availableCount < rule.limit * 1.5,
                };
            }));
            ruleStatusList.push(...sectionRuleResults);
        }));
        const isHealthy = matrixExists !== false && ruleStatusList.every((r) => r.isSufficient);
        const hasWarning = ruleStatusList.some((r) => r.isWarning);
        return {
            lessonId,
            examId: exam._id.toString(),
            isHealthy,
            hasWarning,
            isLocked,
            matrixExists,
            configMode,
            rules: ruleStatusList,
        };
    }
    async getQuizAnalyticsData(teacherId, courseId, lessonId) {
        await this.validateCourseOwnership(courseId, teacherId);
        const lesson = await this.lessonsRepo.findByIdSafe(new mongoose_1.Types.ObjectId(lessonId), { populate: 'examId' });
        if (!lesson || lesson.courseId.toString() !== courseId) {
            throw new common_1.NotFoundException('Bài học không tồn tại trong khóa học này.');
        }
        const exam = lesson.examId;
        const totalScore = exam.totalScore || 100;
        const passPercentage = lesson.examRules?.passPercentage || 50;
        return this.submissionsRepo.getQuizAnalyticsData(lessonId, passPercentage, totalScore);
    }
    async getTeacherAttemptHistory(teacherId, courseId, lessonId, page, limit, search) {
        await this.validateCourseOwnership(courseId, teacherId);
        const lesson = await this.lessonsRepo.findOneSafe({ _id: new mongoose_1.Types.ObjectId(lessonId), courseId: new mongoose_1.Types.ObjectId(courseId) });
        if (!lesson)
            throw new common_1.NotFoundException('Bài học không tồn tại.');
        return this.submissionsRepo.getTeacherAttemptHistoryData(courseId, lessonId, page, limit, search);
    }
    async assignStaticQuestions(teacherId, courseId, lessonId, questionIds) {
        await this.validateCourseOwnership(courseId, teacherId);
        const lesson = await this.lessonsRepo.findByIdSafe(new mongoose_1.Types.ObjectId(lessonId));
        if (!lesson || lesson.courseId.toString() !== courseId) {
            throw new common_1.NotFoundException('Bài học không tồn tại.');
        }
        if (!lesson.examId)
            throw new common_1.BadRequestException('Bài học này không phải là Quiz.');
        const objectIds = questionIds.map(id => new mongoose_1.Types.ObjectId(id));
        const questions = await this.questionsRepo.modelInstance
            .find({ _id: { $in: objectIds }, ownerId: new mongoose_1.Types.ObjectId(teacherId), isArchived: false, isDraft: false })
            .lean()
            .exec();
        if (questions.length !== questionIds.length) {
            throw new common_1.BadRequestException('Một số câu hỏi không tồn tại, đang là bản nháp, hoặc bạn không có quyền sử dụng.');
        }
        const paperQuestions = [];
        const answerKeys = [];
        let orderIdx = 1;
        for (const q of questions) {
            const correctAns = q.answers?.find((a) => a.isCorrect);
            if (!correctAns && q.type !== 'PASSAGE') {
                throw new common_1.BadRequestException(`Câu hỏi gốc ID ${q._id} chưa được set đáp án đúng.`);
            }
            paperQuestions.push({
                originalQuestionId: q._id,
                type: q.type,
                parentPassageId: q.parentPassageId || null,
                orderIndex: orderIdx++,
                content: q.content,
                explanation: q.explanation || null,
                difficultyLevel: q.difficultyLevel,
                answers: q.answers?.map((a) => ({ id: a.id, content: a.content })) || [],
                attachedMedia: q.attachedMedia || [],
                points: null
            });
            if (correctAns) {
                answerKeys.push({
                    originalQuestionId: q._id,
                    correctAnswerId: correctAns.id
                });
            }
        }
        await this.examsRepo.executeInTransaction(async () => {
            await this.examPapersRepo.deleteManySafe({
                examId: lesson.examId,
                submissionId: null
            });
            await this.examPapersRepo.createDocument({
                examId: lesson.examId,
                submissionId: null,
                questions: paperQuestions,
                answerKeys: answerKeys,
            });
            await this.examsRepo.updateByIdSafe(lesson.examId, {
                $set: { mode: exam_schema_1.ExamMode.STATIC }
            });
        });
        this.logger.log(`[Static Builder] Teacher ${teacherId} assigned ${questions.length} static questions to Quiz ${lessonId}`);
        return { totalAssigned: questions.length };
    }
};
exports.CourseQuizBuilderService = CourseQuizBuilderService;
exports.CourseQuizBuilderService = CourseQuizBuilderService = CourseQuizBuilderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [courses_repository_1.CoursesRepository,
        sections_repository_1.SectionsRepository,
        lessons_repository_1.LessonsRepository,
        exams_repository_1.ExamsRepository,
        enrollments_repository_1.EnrollmentsRepository,
        exam_submissions_repository_1.ExamSubmissionsRepository,
        questions_repository_1.QuestionsRepository,
        exam_papers_repository_1.ExamPapersRepository,
        redis_service_1.RedisService,
        event_emitter_1.EventEmitter2,
        exam_matrices_service_1.ExamMatricesService,
        exam_generator_service_1.ExamGeneratorService])
], CourseQuizBuilderService);
//# sourceMappingURL=course-quiz-builder.service.js.map