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
exports.EmbeddedExamConfigDto = exports.EmbeddedExamSectionDto = exports.EmbeddedExamRuleDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const question_schema_1 = require("../../questions/schemas/question.schema");
class EmbeddedExamRuleDto {
    folderIds;
    topicIds;
    difficulties;
    tags;
    limit;
}
exports.EmbeddedExamRuleDto = EmbeddedExamRuleDto;
__decorate([
    (0, class_validator_1.IsArray)({ message: 'folderIds phải là một mảng' }),
    (0, class_validator_1.IsMongoId)({ each: true, message: 'ID thư mục không hợp lệ' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], EmbeddedExamRuleDto.prototype, "folderIds", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'topicIds phải là một mảng' }),
    (0, class_validator_1.IsMongoId)({ each: true, message: 'ID chuyên đề không hợp lệ' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], EmbeddedExamRuleDto.prototype, "topicIds", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'difficulties phải là một mảng' }),
    (0, class_validator_1.IsEnum)(question_schema_1.DifficultyLevel, { each: true, message: 'Mức độ khó không hợp lệ' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], EmbeddedExamRuleDto.prototype, "difficulties", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'tags phải là một mảng' }),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], EmbeddedExamRuleDto.prototype, "tags", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Số lượng câu hỏi (limit) phải là số nguyên' }),
    (0, class_validator_1.Min)(1, { message: 'Mỗi Rule phải lấy ít nhất 1 câu hỏi' }),
    __metadata("design:type", Number)
], EmbeddedExamRuleDto.prototype, "limit", void 0);
class EmbeddedExamSectionDto {
    name;
    orderIndex;
    rules;
}
exports.EmbeddedExamSectionDto = EmbeddedExamSectionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên Section/Phần thi không được để trống' }),
    __metadata("design:type", String)
], EmbeddedExamSectionDto.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], EmbeddedExamSectionDto.prototype, "orderIndex", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => EmbeddedExamRuleDto),
    __metadata("design:type", Array)
], EmbeddedExamSectionDto.prototype, "rules", void 0);
class EmbeddedExamConfigDto {
    title;
    totalScore;
    matrixId;
    adHocSections;
}
exports.EmbeddedExamConfigDto = EmbeddedExamConfigDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tiêu đề đề thi không được để trống' }),
    __metadata("design:type", String)
], EmbeddedExamConfigDto.prototype, "title", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Tổng điểm phải là số nguyên' }),
    (0, class_validator_1.Min)(0, { message: 'Tổng điểm không được âm' }),
    __metadata("design:type", Number)
], EmbeddedExamConfigDto.prototype, "totalScore", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)({ message: 'ID Ma trận mẫu (matrixId) không hợp lệ' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EmbeddedExamConfigDto.prototype, "matrixId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => EmbeddedExamSectionDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], EmbeddedExamConfigDto.prototype, "adHocSections", void 0);
//# sourceMappingURL=embedded-exam-config.dto.js.map