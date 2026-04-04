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
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const class_transformer_1 = require("class-transformer");
const media_service_1 = require("./media.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const media_schema_1 = require("./schemas/media.schema");
const media_response_dto_1 = require("./dto/media-response.dto");
const ticket_dto_1 = require("./dto/ticket.dto");
const sync_cloudinary_dto_1 = require("./dto/sync-cloudinary.dto");
let MediaController = class MediaController {
    mediaService;
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    getSignature(userId, contextInput) {
        const isValidContext = Object.values(media_schema_1.MediaContext).includes(contextInput);
        const context = isValidContext
            ? contextInput
            : media_schema_1.MediaContext.GENERAL;
        return {
            message: 'Lấy chữ ký bảo mật thành công',
            data: this.mediaService.generateSignature(userId, context),
        };
    }
    async syncCloudinary(userId, dto) {
        const payload = {
            publicId: dto.publicId,
            format: dto.format,
            bytes: dto.bytes,
            originalName: dto.originalName,
            context: dto.context,
        };
        const media = await this.mediaService.syncCloudinaryMedia(userId, payload);
        return {
            message: 'Đồng bộ tài nguyên lưu trữ thành công',
            data: (0, class_transformer_1.plainToInstance)(media_response_dto_1.MediaResponseDto, media, {
                excludeExtraneousValues: true,
            }),
        };
    }
    async requestVideoTicket() {
        throw new common_1.BadRequestException('API cấp vé Google Drive đã ngừng hoạt động để nâng cấp hạ tầng. Vui lòng cập nhật Frontend sử dụng luồng Cloudinary Direct Upload.');
    }
    async confirmUpload(userId, dto) {
        const media = await this.mediaService.confirmUpload(dto.mediaId, userId);
        return {
            message: 'Xác nhận lưu trữ file thành công',
            data: (0, class_transformer_1.plainToInstance)(media_response_dto_1.MediaResponseDto, media, {
                excludeExtraneousValues: true,
            }),
        };
    }
    async uploadSingle() {
        throw new common_1.BadRequestException('API này đã ngừng hỗ trợ. Vui lòng nâng cấp Frontend để sử dụng chuẩn Direct Upload mới.');
    }
    async requestDocumentTicket() {
        throw new common_1.BadRequestException('Hệ thống lưu trữ tài liệu đã được nâng cấp. Vui lòng không sử dụng phương thức cũ.');
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Get)('signature'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Query)('context')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "getSignature", null);
__decorate([
    (0, common_1.Post)('upload/cloudinary/sync'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, sync_cloudinary_dto_1.SyncCloudinaryDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "syncCloudinary", null);
__decorate([
    (0, common_1.Post)('upload/video/ticket'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "requestVideoTicket", null);
__decorate([
    (0, common_1.Post)('upload/confirm'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ticket_dto_1.ConfirmUploadDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "confirmUpload", null);
__decorate([
    (0, common_1.Post)('upload/single'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadSingle", null);
__decorate([
    (0, common_1.Post)('upload/document/ticket'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "requestDocumentTicket", null);
exports.MediaController = MediaController = __decorate([
    (0, common_1.Controller)('media'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaController);
//# sourceMappingURL=media.controller.js.map