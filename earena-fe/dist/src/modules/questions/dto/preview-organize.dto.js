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
exports.PreviewOrganizeDto = void 0;
const class_validator_1 = require("class-validator");
const question_organizer_interface_1 = require("../interfaces/question-organizer.interface");
class PreviewOrganizeDto {
    questionIds;
    strategy;
    baseFolderId;
}
exports.PreviewOrganizeDto = PreviewOrganizeDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({
        each: true,
        message: 'Danh sách ID câu hỏi chứa định dạng không hợp lệ.',
    }),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'Phải chọn ít nhất 1 câu hỏi để phân tích.' }),
    __metadata("design:type", Array)
], PreviewOrganizeDto.prototype, "questionIds", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(question_organizer_interface_1.OrganizeStrategy, { message: 'Chiến lược phân loại không hợp lệ.' }),
    __metadata("design:type", String)
], PreviewOrganizeDto.prototype, "strategy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ message: 'ID thư mục gốc (baseFolderId) không hợp lệ.' }),
    __metadata("design:type", String)
], PreviewOrganizeDto.prototype, "baseFolderId", void 0);
//# sourceMappingURL=preview-organize.dto.js.map