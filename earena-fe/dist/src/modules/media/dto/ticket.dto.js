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
exports.ConfirmUploadDto = exports.RequestUploadTicketDto = void 0;
const class_validator_1 = require("class-validator");
const media_schema_1 = require("../schemas/media.schema");
class RequestUploadTicketDto {
    fileName;
    mimeType;
    size;
    context;
}
exports.RequestUploadTicketDto = RequestUploadTicketDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên file không được để trống' }),
    (0, class_validator_1.Matches)(/^[^\\/:\*\?"<>\|]+$/, {
        message: 'Tên file chứa ký tự không hợp lệ',
    }),
    __metadata("design:type", String)
], RequestUploadTicketDto.prototype, "fileName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Định dạng file không được để trống' }),
    (0, class_validator_1.Matches)(/^(video\/(mp4|webm|x-matroska)|application\/pdf)$/i, {
        message: 'Định dạng file không được hỗ trợ',
    }),
    __metadata("design:type", String)
], RequestUploadTicketDto.prototype, "mimeType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1, { message: 'Kích thước file không hợp lệ (nhỏ nhất 1 byte)' }),
    (0, class_validator_1.Max)(2147483648, {
        message: 'Kích thước file vượt mức cho phép của hệ thống (Tối đa 2GB)',
    }),
    __metadata("design:type", Number)
], RequestUploadTicketDto.prototype, "size", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(media_schema_1.MediaContext, { message: 'Ngữ cảnh (context) không hợp lệ' }),
    __metadata("design:type", String)
], RequestUploadTicketDto.prototype, "context", void 0);
class ConfirmUploadDto {
    mediaId;
}
exports.ConfirmUploadDto = ConfirmUploadDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Media ID không được để trống' }),
    __metadata("design:type", String)
], ConfirmUploadDto.prototype, "mediaId", void 0);
//# sourceMappingURL=ticket.dto.js.map