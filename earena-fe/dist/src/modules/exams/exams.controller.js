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
exports.ExamsController = void 0;
const common_1 = require("@nestjs/common");
const exams_service_1 = require("./exams.service");
const exam_generator_service_1 = require("./exam-generator.service");
const dto_1 = require("./dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const teacher_verified_decorator_1 = require("../../common/decorators/teacher-verified.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const generate_exam_dto_1 = require("./dto/generate-exam.dto");
const fill_from_matrix_dto_1 = require("./dto/fill-from-matrix.dto");
const update_paper_points_dto_1 = require("./dto/update-paper-points.dto");
const exam_matrix_dto_1 = require("./dto/exam-matrix.dto");
const preview_dynamic_exam_dto_1 = require("./dto/preview-dynamic-exam.dto");
let ExamsController = class ExamsController {
    examsService;
    examGeneratorService;
    constructor(examsService, examGeneratorService) {
        this.examsService = examsService;
        this.examGeneratorService = examGeneratorService;
    }
    async initManualExam(dto, userId) {
        const payload = {
            title: dto.title,
            description: dto.description,
            totalScore: dto.totalScore,
            subjectId: dto.subjectId,
        };
        return this.examsService.initManualExam(userId, payload);
    }
    async updatePaperQuestions(paperId, dto, userId) {
        const payload = {
            action: dto.action,
            questionId: dto.questionId,
            questionIds: dto.questionIds,
        };
        return this.examsService.updatePaperQuestions(paperId, userId, payload);
    }
    async generateDynamicExam(dto, userId) {
        const payload = {
            teacherId: userId,
            title: dto.title,
            totalScore: dto.totalScore,
            matrixId: dto.matrixId,
            adHocSections: dto.adHocSections,
        };
        return this.examGeneratorService.generateDynamicExam(payload);
    }
    async previewDynamicExam(userId, dto) {
        const payload = {
            teacherId: userId,
            matrixId: dto.matrixId,
            adHocSections: dto.adHocSections?.map((sec) => ({
                name: sec.name,
                orderIndex: sec.orderIndex,
                rules: sec.rules.map((r) => ({
                    folderIds: r.folderIds,
                    topicIds: r.topicIds,
                    difficulties: r.difficulties,
                    tags: r.tags,
                    limit: r.limit,
                })),
            })),
        };
        return this.examGeneratorService.previewDynamicExam(payload);
    }
    async getExams(dto, userId) {
        const payload = {
            page: dto.page,
            limit: dto.limit,
            search: dto.search,
            type: dto.type,
            subjectId: dto.subjectId,
        };
        return this.examsService.getExams(userId, payload);
    }
    async getPaperDetail(paperId, userId) {
        return this.examsService.getPaperDetail(paperId, userId);
    }
    async updateExam(examId, dto, userId) {
        const payload = {
            title: dto.title,
            description: dto.description,
            totalScore: dto.totalScore,
        };
        return this.examsService.updateExam(examId, userId, payload);
    }
    async deleteExam(examId, userId) {
        return this.examsService.deleteExam(examId, userId);
    }
    async getLeaderboard(courseId, lessonId, dto, userId) {
        const payload = {
            courseId,
            lessonId,
            page: dto.page,
            limit: dto.limit,
            search: dto.search,
        };
        return this.examsService.getLeaderboard(userId, payload);
    }
    async publishExam(examId, userId) {
        return this.examsService.publishExam(examId, userId);
    }
    async fillExistingPaperFromMatrix(paperId, dto, userId) {
        const payload = {
            teacherId: userId,
            paperId: paperId,
            matrixId: dto.matrixId,
            adHocSections: dto.adHocSections,
        };
        return this.examGeneratorService.fillExistingPaperFromMatrix(payload);
    }
    async updatePaperPoints(paperId, dto, userId) {
        const payload = {
            divideEqually: dto.divideEqually,
            pointsData: dto.pointsData,
        };
        return this.examsService.updatePaperPoints(paperId, userId, payload);
    }
    async previewMatrixRule(paperId, dto, userId) {
        const payload = {
            teacherId: userId,
            paperId: paperId,
            rule: {
                folderIds: dto.folderIds,
                topicIds: dto.topicIds,
                difficulties: dto.difficulties,
                tags: dto.tags,
                limit: dto.limit,
            },
        };
        return this.examGeneratorService.previewRuleAvailability(payload);
    }
};
exports.ExamsController = ExamsController;
__decorate([
    (0, common_1.Post)('manual/init'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.InitManualExamDto, String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "initManualExam", null);
__decorate([
    (0, common_1.Patch)('manual/papers/:paperId/questions'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('paperId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdatePaperQuestionsDto, String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "updatePaperQuestions", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_exam_dto_1.GenerateDynamicExamDto, String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "generateDynamicExam", null);
__decorate([
    (0, common_1.Post)('dynamic/preview'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, preview_dynamic_exam_dto_1.PreviewDynamicExamDto]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "previewDynamicExam", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetExamsDto, String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getExams", null);
__decorate([
    (0, common_1.Get)('manual/papers/:paperId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('paperId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getPaperDetail", null);
__decorate([
    (0, common_1.Patch)(':examId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('examId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateExamDto, String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "updateExam", null);
__decorate([
    (0, common_1.Delete)(':examId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('examId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "deleteExam", null);
__decorate([
    (0, common_1.Get)('leaderboard/courses/:courseId/lessons/:lessonId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Param)('lessonId')),
    __param(2, (0, common_1.Query)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.GetLeaderboardDto, String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Post)(':examId/publish'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('examId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "publishExam", null);
__decorate([
    (0, common_1.Post)('manual/papers/:paperId/fill-from-matrix'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('paperId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, fill_from_matrix_dto_1.FillFromMatrixDto, String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "fillExistingPaperFromMatrix", null);
__decorate([
    (0, common_1.Patch)('manual/papers/:paperId/points'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('paperId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_paper_points_dto_1.UpdatePaperPointsDto, String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "updatePaperPoints", null);
__decorate([
    (0, common_1.Post)('manual/papers/:paperId/matrix/preview-rule'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('paperId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, exam_matrix_dto_1.MatrixRuleDto, String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "previewMatrixRule", null);
exports.ExamsController = ExamsController = __decorate([
    (0, common_1.Controller)('exams'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, teacher_verified_decorator_1.RequireTeacherVerified)(),
    __metadata("design:paramtypes", [exams_service_1.ExamsService,
        exam_generator_service_1.ExamGeneratorService])
], ExamsController);
//# sourceMappingURL=exams.controller.js.map