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
exports.ExamTakeController = void 0;
const common_1 = require("@nestjs/common");
const exam_take_service_1 = require("./exam-take.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const exam_take_dto_1 = require("./dto/exam-take.dto");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let ExamTakeController = class ExamTakeController {
    examTakeService;
    constructor(examTakeService) {
        this.examTakeService = examTakeService;
    }
    async startExam(userId, dto) {
        const payload = {
            studentId: userId,
            courseId: dto.courseId,
            lessonId: dto.lessonId,
        };
        return this.examTakeService.startExam(payload);
    }
    async autoSave(submissionId, dto, studentId) {
        return this.examTakeService.autoSaveAnswer({
            submissionId,
            studentId,
            questionId: dto.questionId,
            selectedAnswerId: dto.selectedAnswerId,
        });
    }
    async submitExam(submissionId, studentId) {
        return this.examTakeService.submitExam({ submissionId, studentId });
    }
    async getResult(submissionId, studentId) {
        return this.examTakeService.getSubmissionResult(submissionId, studentId);
    }
    async getHistory(dto, studentId) {
        const payload = {
            studentId,
            page: dto.page,
            limit: dto.limit,
            courseId: dto.courseId,
            lessonId: dto.lessonId,
        };
        return this.examTakeService.getStudentHistory(payload);
    }
    async getHistoryOverview(dto, studentId) {
        const payload = {
            studentId,
            page: dto.page || 1,
            limit: dto.limit || 10,
            courseId: dto.courseId,
        };
        return this.examTakeService.getStudentHistoryOverview(payload);
    }
    async getLessonAttempts(params, query, studentId) {
        const payload = {
            studentId,
            lessonId: params.lessonId,
            page: query.page || 1,
            limit: query.limit || 10,
        };
        return this.examTakeService.getLessonAttempts(payload);
    }
};
exports.ExamTakeController = ExamTakeController;
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, exam_take_dto_1.StartExamDto]),
    __metadata("design:returntype", Promise)
], ExamTakeController.prototype, "startExam", null);
__decorate([
    (0, common_1.Patch)(':submissionId/auto-save'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('submissionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, exam_take_dto_1.AutoSaveDto, String]),
    __metadata("design:returntype", Promise)
], ExamTakeController.prototype, "autoSave", null);
__decorate([
    (0, common_1.Post)(':submissionId/submit'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('submissionId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExamTakeController.prototype, "submitExam", null);
__decorate([
    (0, common_1.Get)(':submissionId/result'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('submissionId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExamTakeController.prototype, "getResult", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [exam_take_dto_1.GetStudentHistoryDto, String]),
    __metadata("design:returntype", Promise)
], ExamTakeController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('history/overview'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [exam_take_dto_1.GetStudentHistoryOverviewDto, String]),
    __metadata("design:returntype", Promise)
], ExamTakeController.prototype, "getHistoryOverview", null);
__decorate([
    (0, common_1.Get)('history/lesson/:lessonId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [exam_take_dto_1.GetLessonAttemptsParamDto,
        exam_take_dto_1.GetLessonAttemptsQueryDto, String]),
    __metadata("design:returntype", Promise)
], ExamTakeController.prototype, "getLessonAttempts", null);
exports.ExamTakeController = ExamTakeController = __decorate([
    (0, common_1.Controller)('exam-take'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [exam_take_service_1.ExamTakeService])
], ExamTakeController);
//# sourceMappingURL=exam-take.controller.js.map