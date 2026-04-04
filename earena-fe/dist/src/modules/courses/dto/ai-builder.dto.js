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
exports.GenerateAiCourseDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class GenerateAiCourseDto {
    targetSectionCount;
    additionalInstructions;
}
exports.GenerateAiCourseDto = GenerateAiCourseDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? undefined : parsed;
    }),
    (0, class_validator_1.IsInt)({ message: 'Số lượng chương mục phải là số nguyên' }),
    (0, class_validator_1.Min)(1, { message: 'Cần ít nhất 1 chương' }),
    (0, class_validator_1.Max)(50, { message: 'Tối đa 50 chương để đảm bảo hiệu suất AI' }),
    __metadata("design:type", Number)
], GenerateAiCourseDto.prototype, "targetSectionCount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Ghi chú (Prompt) phải là chuỗi văn bản' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], GenerateAiCourseDto.prototype, "additionalInstructions", void 0);
//# sourceMappingURL=ai-builder.dto.js.map