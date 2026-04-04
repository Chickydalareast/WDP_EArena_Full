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
exports.AiTestController = exports.StrictFileTypeValidator = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const uuid_1 = require("uuid");
const path_1 = require("path");
const ai_service_1 = require("./ai.service");
const test_ai_dto_1 = require("./dto/test-ai.dto");
const analyze_document_dto_1 = require("./dto/analyze-document.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const public_decorator_1 = require("../../common/decorators/public.decorator");
class StrictFileTypeValidator extends common_1.FileValidator {
    constructor() {
        super({});
    }
    isValid(file) {
        if (!file || !file.mimetype)
            return false;
        const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const mimeType = file.mimetype.split(';')[0].trim().toLowerCase();
        return allowedMimeTypes.includes(mimeType);
    }
    buildErrorMessage(file) {
        return `Định dạng tệp ${file?.mimetype || 'không xác định'} không được hỗ trợ. Hệ thống chỉ chấp nhận PDF và Hình ảnh (JPEG, PNG, WEBP).`;
    }
}
exports.StrictFileTypeValidator = StrictFileTypeValidator;
let AiTestController = class AiTestController {
    aiService;
    constructor(aiService) {
        this.aiService = aiService;
    }
    async testChat(dto) {
        const payload = {
            providerName: dto.providerName,
            modelId: dto.modelId,
            userMessage: dto.userMessage,
            systemPrompt: dto.systemPrompt,
            temperature: dto.temperature,
        };
        const result = await this.aiService.processTextRequest(payload);
        return {
            message: 'Gọi AI Model thành công',
            data: result,
        };
    }
    async analyzeDocument(dto, file) {
        const payload = {
            providerName: dto.providerName,
            modelId: dto.modelId,
            documents: [{
                    filePath: file.path,
                    mimeType: file.mimetype
                }],
            userMessage: dto.userMessage,
            systemPrompt: dto.systemPrompt,
            temperature: dto.temperature,
            responseFormat: dto.responseFormat,
        };
        const result = await this.aiService.processDocumentRequest(payload);
        return {
            message: 'Phân tích tài liệu thành công',
            data: result,
        };
    }
};
exports.AiTestController = AiTestController;
__decorate([
    (0, common_1.Post)('chat'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [test_ai_dto_1.TestAiDto]),
    __metadata("design:returntype", Promise)
], AiTestController.prototype, "testChat", null);
__decorate([
    (0, common_1.Post)('analyze-document'),
    (0, public_decorator_1.Public)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './temp_uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = `${(0, uuid_1.v4)()}${(0, path_1.extname)(file.originalname)}`;
                cb(null, uniqueSuffix);
            }
        })
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024, message: 'Dung lượng file vượt quá 20MB' }),
            new StrictFileTypeValidator(),
        ],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analyze_document_dto_1.AnalyzeDocumentDto, Object]),
    __metadata("design:returntype", Promise)
], AiTestController.prototype, "analyzeDocument", null);
exports.AiTestController = AiTestController = __decorate([
    (0, common_1.Controller)('ai/test'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiTestController);
//# sourceMappingURL=ai-test.controller.js.map