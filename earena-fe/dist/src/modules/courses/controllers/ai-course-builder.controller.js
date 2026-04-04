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
exports.AiCourseBuilderController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const teacher_verified_decorator_1 = require("../../../common/decorators/teacher-verified.decorator");
const user_role_enum_1 = require("../../../common/enums/user-role.enum");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const ai_builder_dto_1 = require("../dto/ai-builder.dto");
const ai_course_builder_service_1 = require("../services/ai-course-builder.service");
const ai_upload_constant_1 = require("../constants/ai-upload.constant");
let AiCourseBuilderController = class AiCourseBuilderController {
    aiCourseBuilderService;
    constructor(aiCourseBuilderService) {
        this.aiCourseBuilderService = aiCourseBuilderService;
    }
    async generateCourseContent(courseId, teacherId, dto, files) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('Bắt buộc phải tải lên ít nhất 1 tài liệu để AI phân tích.');
        }
        const mappedFiles = files.map((file) => ({
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            filePath: file.path,
        }));
        const payload = {
            courseId,
            teacherId,
            files: mappedFiles,
            targetSectionCount: dto.targetSectionCount,
            additionalInstructions: dto.additionalInstructions,
        };
        const result = await this.aiCourseBuilderService.generateCurriculum(payload);
        return {
            message: 'AI đã phân tích và tự động tạo giáo án thành công.',
            data: result,
        };
    }
};
exports.AiCourseBuilderController = AiCourseBuilderController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', ai_upload_constant_1.AI_UPLOAD_LIMITS.MAX_FILES, ai_upload_constant_1.aiMulterOptions)),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, ai_builder_dto_1.GenerateAiCourseDto, Array]),
    __metadata("design:returntype", Promise)
], AiCourseBuilderController.prototype, "generateCourseContent", null);
exports.AiCourseBuilderController = AiCourseBuilderController = __decorate([
    (0, common_1.Controller)('courses/:courseId/ai-builder'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, teacher_verified_decorator_1.RequireTeacherVerified)(),
    __metadata("design:paramtypes", [ai_course_builder_service_1.AiCourseBuilderService])
], AiCourseBuilderController);
//# sourceMappingURL=ai-course-builder.controller.js.map