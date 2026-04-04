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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseQuizBuilderController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const course_quiz_builder_dto_1 = require("../dto/course-quiz-builder.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const teacher_verified_decorator_1 = require("../../../common/decorators/teacher-verified.decorator");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const user_role_enum_1 = require("../../../common/enums/user-role.enum");
const course_quiz_builder_service_1 = require("../services/course-quiz-builder.service");
let CourseQuizBuilderController = class CourseQuizBuilderController {
    courseQuizBuilderService;
    constructor(courseQuizBuilderService) {
        this.courseQuizBuilderService = courseQuizBuilderService;
    }
    mapDynamicConfig(dtoConfig) {
        if (!dtoConfig)
            return undefined;
        return {
            ...(dtoConfig.sourceFolders && {
                sourceFolders: dtoConfig.sourceFolders.map((id) => new mongoose_1.Types.ObjectId(id)),
            }),
            ...(dtoConfig.mixRatio && { mixRatio: dtoConfig.mixRatio }),
            ...(dtoConfig.matrixId && {
                matrixId: new mongoose_1.Types.ObjectId(dtoConfig.matrixId),
            }),
            ...(dtoConfig.adHocSections && {
                adHocSections: dtoConfig.adHocSections,
            }),
        };
    }
    async createQuizLesson(teacherId, dto) {
        const params = {
            teacherId,
            courseId: dto.courseId,
            sectionId: dto.sectionId,
            title: dto.title,
            content: dto.content,
            isFreePreview: dto.isFreePreview,
            totalScore: dto.totalScore,
            dynamicConfig: this.mapDynamicConfig(dto.dynamicConfig),
            examRules: {
                timeLimit: dto.examRules.timeLimit,
                maxAttempts: dto.examRules.maxAttempts,
                passPercentage: dto.examRules.passPercentage,
                showResultMode: dto.examRules.showResultMode,
            },
        };
        const result = await this.courseQuizBuilderService.createUnifiedQuizLesson(params);
        return {
            message: 'Tạo Bài học dạng Quiz thành công.',
            data: result,
        };
    }
    async updateQuizLesson(teacherId, dto) {
        const params = {
            teacherId,
            courseId: dto.courseId,
            lessonId: dto.lessonId,
            title: dto.title,
            content: dto.content,
            isFreePreview: dto.isFreePreview,
            totalScore: dto.totalScore,
            dynamicConfig: this.mapDynamicConfig(dto.dynamicConfig),
            examRules: dto.examRules
                ? {
                    timeLimit: dto.examRules.timeLimit,
                    maxAttempts: dto.examRules.maxAttempts,
                    passPercentage: dto.examRules.passPercentage,
                    showResultMode: dto.examRules.showResultMode,
                }
                : undefined,
        };
        const result = await this.courseQuizBuilderService.updateUnifiedQuizLesson(params);
        return {
            message: 'Cập nhật Bài học dạng Quiz thành công.',
            data: result,
        };
    }
    async deleteQuizLesson(teacherId, dto) {
        const params = {
            teacherId,
            courseId: dto.courseId,
            lessonId: dto.lessonId,
        };
        await this.courseQuizBuilderService.deleteUnifiedQuizLesson(params);
        return {
            message: 'Xóa Bài học Quiz và dọn dẹp dữ liệu thành công.',
        };
    }
    async getCompatibleMatrices(teacherId, dto) {
        const params = {
            teacherId,
            courseId: dto.courseId,
            page: dto.page ?? 1,
            limit: dto.limit ?? 10,
            search: dto.search,
        };
        const result = await this.courseQuizBuilderService.getMatricesByCourseSubject(params);
        return {
            message: 'Lấy danh sách Khuôn mẫu Ma trận tương thích thành công.',
            data: result,
        };
    }
    async getRuleAvailableCount(teacherId, dto) {
        const params = {
            teacherId,
            folderIds: dto.folderIds,
            topicIds: dto.topicIds,
            difficulties: dto.difficulties,
            tags: dto.tags,
            limit: dto.limit,
        };
        const result = await this.courseQuizBuilderService.getAvailableCountForRule(params);
        return {
            message: 'Kiểm tra số lượng câu hỏi khả dụng thành công.',
            data: result,
        };
    }
    async previewQuizConfig(teacherId, dto) {
        const params = {
            teacherId,
            matrixId: dto.matrixId,
            adHocSections: dto.adHocSections?.map((sec) => ({
                name: sec.name,
                orderIndex: sec.orderIndex ?? 0,
                rules: sec.rules.map((rule) => ({
                    folderIds: rule.folderIds,
                    topicIds: rule.topicIds,
                    difficulties: rule.difficulties,
                    tags: rule.tags,
                    limit: rule.limit,
                })),
            })),
        };
        const result = await this.courseQuizBuilderService.previewQuizConfig(params);
        return {
            message: result.message,
            data: {
                totalItems: result.totalItems,
                totalActualQuestions: result.totalActualQuestions,
                previewData: result.previewData,
            },
        };
    }
    async getQuizHealth(teacherId, courseId, lessonId) {
        if (!courseId) {
            throw new common_1.BadRequestException('courseId là bắt buộc.');
        }
        const params = { teacherId, courseId, lessonId };
        const result = await this.courseQuizBuilderService.getQuizHealth(params);
        return {
            message: result.isHealthy
                ? 'Quiz đang trong trạng thái hoạt động tốt.'
                : result.configMode === 'unconfigured'
                    ? 'Quiz chưa được cấu hình nguồn câu hỏi.'
                    : 'Quiz có vấn đề về nguồn câu hỏi, cần kiểm tra ngay.',
            data: result,
        };
    }
    async getQuizAnalytics(teacherId, courseId, lessonId) {
        if (!courseId)
            throw new common_1.BadRequestException('courseId là bắt buộc.');
        const result = await this.courseQuizBuilderService.getQuizAnalyticsData(teacherId, courseId, lessonId);
        return {
            message: 'Lấy thống kê phân tích bài thi thành công.',
            data: result,
        };
    }
    async getTeacherAttemptHistory(teacherId, courseId, lessonId, page, limit, search) {
        if (!courseId)
            throw new common_1.BadRequestException('courseId là bắt buộc.');
        const result = await this.courseQuizBuilderService.getTeacherAttemptHistory(teacherId, courseId, lessonId, page || 1, limit || 10, search);
        return {
            message: 'Lấy lịch sử làm bài của học viên thành công.',
            data: result.data,
            meta: result.meta,
        };
    }
    async assignStaticQuestions(teacherId, courseId, lessonId, questionIds) {
        if (!courseId)
            throw new common_1.BadRequestException('courseId là bắt buộc.');
        if (!Array.isArray(questionIds) || questionIds.length === 0) {
            throw new common_1.BadRequestException('Danh sách questionIds không được để trống.');
        }
        const result = await this.courseQuizBuilderService.assignStaticQuestions(teacherId, courseId, lessonId, questionIds);
        return {
            message: 'Gán danh sách câu hỏi cố định vào đề thi thành công.',
            data: result,
        };
    }
};
exports.CourseQuizBuilderController = CourseQuizBuilderController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, course_quiz_builder_dto_1.CreateCourseQuizDto]),
    __metadata("design:returntype", Promise)
], CourseQuizBuilderController.prototype, "createQuizLesson", null);
__decorate([
    (0, common_1.Put)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, course_quiz_builder_dto_1.UpdateCourseQuizDto]),
    __metadata("design:returntype", Promise)
], CourseQuizBuilderController.prototype, "updateQuizLesson", null);
__decorate([
    (0, common_1.Delete)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, course_quiz_builder_dto_1.DeleteCourseQuizDto]),
    __metadata("design:returntype", Promise)
], CourseQuizBuilderController.prototype, "deleteQuizLesson", null);
__decorate([
    (0, common_1.Get)('matrices'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, course_quiz_builder_dto_1.GetQuizMatricesDto]),
    __metadata("design:returntype", Promise)
], CourseQuizBuilderController.prototype, "getCompatibleMatrices", null);
__decorate([
    (0, common_1.Post)('rule-preview'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, course_quiz_builder_dto_1.RulePreviewDto]),
    __metadata("design:returntype", Promise)
], CourseQuizBuilderController.prototype, "getRuleAvailableCount", null);
__decorate([
    (0, common_1.Post)('preview'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, course_quiz_builder_dto_1.PreviewQuizConfigDto]),
    __metadata("design:returntype", Promise)
], CourseQuizBuilderController.prototype, "previewQuizConfig", null);
__decorate([
    (0, common_1.Get)(':lessonId/health'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Query)('courseId')),
    __param(2, (0, common_1.Param)('lessonId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CourseQuizBuilderController.prototype, "getQuizHealth", null);
__decorate([
    (0, common_1.Get)(':lessonId/stats'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Query)('courseId')),
    __param(2, (0, common_1.Param)('lessonId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CourseQuizBuilderController.prototype, "getQuizAnalytics", null);
__decorate([
    (0, common_1.Get)(':lessonId/attempts'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Query)('courseId')),
    __param(2, (0, common_1.Param)('lessonId')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number, String]),
    __metadata("design:returntype", Promise)
], CourseQuizBuilderController.prototype, "getTeacherAttemptHistory", null);
__decorate([
    (0, common_1.Post)(':lessonId/static-questions'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Query)('courseId')),
    __param(2, (0, common_1.Param)('lessonId')),
    __param(3, (0, common_1.Body)('questionIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Array]),
    __metadata("design:returntype", Promise)
], CourseQuizBuilderController.prototype, "assignStaticQuestions", null);
exports.CourseQuizBuilderController = CourseQuizBuilderController = __decorate([
    (0, common_1.Controller)('courses/builder/quiz'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, teacher_verified_decorator_1.RequireTeacherVerified)(),
    __metadata("design:paramtypes", [course_quiz_builder_service_1.CourseQuizBuilderService])
], CourseQuizBuilderController);
//# sourceMappingURL=course-quiz-builder.controller.js.map