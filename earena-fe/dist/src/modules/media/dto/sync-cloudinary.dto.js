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
exports.SyncCloudinaryDto = void 0;
const class_validator_1 = require("class-validator");
const media_schema_1 = require("../schemas/media.schema");
class SyncCloudinaryDto {
    publicId;
    format;
    bytes;
    originalName;
    context;
}
exports.SyncCloudinaryDto = SyncCloudinaryDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Public ID phải là chuỗi ký tự' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Public ID không được để trống' }),
    __metadata("design:type", String)
], SyncCloudinaryDto.prototype, "publicId", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Định dạng file phải là chuỗi ký tự' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Định dạng file (format) không được để trống' }),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9]+$/, {
        message: 'Định dạng file không hợp lệ (VD: jpg, pdf, png)',
    }),
    __metadata("design:type", String)
], SyncCloudinaryDto.prototype, "format", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'Dung lượng file phải là số' }),
    (0, class_validator_1.Min)(1, { message: 'Dung lượng file không hợp lệ (nhỏ nhất 1 byte)' }),
    __metadata("design:type", Number)
], SyncCloudinaryDto.prototype, "bytes", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Tên file gốc phải là chuỗi ký tự' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên file gốc không được để trống' }),
    (0, class_validator_1.Matches)(/^[^\\/:\*\?"<>\|]+$/, {
        message: 'Tên file chứa ký tự không hợp lệ',
    }),
    __metadata("design:type", String)
], SyncCloudinaryDto.prototype, "originalName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Ngữ cảnh (context) không được để trống' }),
    (0, class_validator_1.IsEnum)(media_schema_1.MediaContext, {
        message: 'Ngữ cảnh (context) không hợp lệ trong hệ thống',
    }),
    __metadata("design:type", String)
], SyncCloudinaryDto.prototype, "context", void 0);
//# sourceMappingURL=sync-cloudinary.dto.js.map