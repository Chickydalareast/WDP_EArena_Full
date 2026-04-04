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
exports.UpdateExamDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class UpdateExamDto {
    title;
    description;
    totalScore;
}
exports.UpdateExamDto = UpdateExamDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Tiêu đề phải là chuỗi văn bản.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tiêu đề không được để trống rỗng.' }),
    __metadata("design:type", String)
], UpdateExamDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Mô tả phải là chuỗi văn bản.' }),
    __metadata("design:type", String)
], UpdateExamDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Tổng điểm phải là số nguyên.' }),
    (0, class_validator_1.Min)(0, { message: 'Tổng điểm không được âm.' }),
    __metadata("design:type", Number)
], UpdateExamDto.prototype, "totalScore", void 0);
//# sourceMappingURL=update-exam.dto.js.map