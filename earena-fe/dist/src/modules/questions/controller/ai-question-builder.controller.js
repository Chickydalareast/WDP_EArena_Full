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
exports.AiQuestionBuilderController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const ai_question_builder_dto_1 = require("../dto/ai-question-builder.dto");
const ai_question_builder_service_1 = require("../services/ai-question-builder.service");
const ai_question_upload_constant_1 = require("../constants/ai-question-upload.constant");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const user_role_enum_1 = require("../../../common/enums/user-role.enum");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const teacher_verified_decorator_1 = require("../../../common/decorators/teacher-verified.decorator");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
let AiQuestionBuilderController = class AiQuestionBuilderController {
    aiQuestionBuilderService;
    constructor(aiQuestionBuilderService) {
        this.aiQuestionBuilderService = aiQuestionBuilderService;
    }
    async generateQuestionsFromFile(teacherId, dto, files) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('Bắt buộc phải tải lên ít nhất 1 file đề thi/tài liệu để AI bóc tách.');
        }
        const mappedFiles = files.map((file) => ({
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            filePath: file.path,
        }));
        const payload = {
            teacherId,
            folderId: dto.folderId,
            files: mappedFiles,
            additionalInstructions: dto.additionalInstructions,
        };
        const result = await this.aiQuestionBuilderService.generateQuestionBank(payload);
        return {
            message: 'AI đang tiến hành phân tích đề thi. Quá trình này có thể mất vài chục giây.',
            data: result,
        };
    }
};
exports.AiQuestionBuilderController = AiQuestionBuilderController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', ai_question_upload_constant_1.AI_QUESTION_UPLOAD_LIMITS.MAX_FILES, ai_question_upload_constant_1.aiQuestionMulterOptions)),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ai_question_builder_dto_1.GenerateAiQuestionDto, Array]),
    __metadata("design:returntype", Promise)
], AiQuestionBuilderController.prototype, "generateQuestionsFromFile", null);
exports.AiQuestionBuilderController = AiQuestionBuilderController = __decorate([
    (0, common_1.Controller)('questions/ai-builder'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, teacher_verified_decorator_1.RequireTeacherVerified)(),
    __metadata("design:paramtypes", [ai_question_builder_service_1.AiQuestionBuilderService])
], AiQuestionBuilderController);
//# sourceMappingURL=ai-question-builder.controller.js.map