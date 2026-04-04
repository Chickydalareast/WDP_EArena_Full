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
exports.UpdateLessonDto = exports.UpdateSectionDto = exports.CreateLessonDto = exports.CreateSectionDto = exports.ExamRuleConfigDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const lesson_schema_1 = require("../schemas/lesson.schema");
const embedded_exam_config_dto_1 = require("./embedded-exam-config.dto");
class ExamRuleConfigDto {
    timeLimit;
    maxAttempts;
    passPercentage;
    showResultMode;
}
exports.ExamRuleConfigDto = ExamRuleConfigDto;
__decorate([
    (0, class_validator_1.IsInt)({ message: 'Thời gian làm bài phải là số nguyên' }),
    (0, class_validator_1.Min)(0, { message: 'Thời gian làm bài không được âm' }),
    __metadata("design:type", Number)
], ExamRuleConfigDto.prototype, "timeLimit", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'Số lần thi phải là số nguyên' }),
    (0, class_validator_1.Min)(1, { message: 'Số lần thi tối thiểu là 1' }),
    __metadata("design:type", Number)
], ExamRuleConfigDto.prototype, "maxAttempts", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'Điểm chuẩn phải là số nguyên' }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100, { message: 'Điểm chuẩn tối đa là 100%' }),
    __metadata("design:type", Number)
], ExamRuleConfigDto.prototype, "passPercentage", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(lesson_schema_1.ShowResultMode, { message: 'Chế độ hiển thị kết quả không hợp lệ' }),
    __metadata("design:type", String)
], ExamRuleConfigDto.prototype, "showResultMode", void 0);
class CreateSectionDto {
    title;
    description;
}
exports.CreateSectionDto = CreateSectionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên chương/phần không được để trống' }),
    __metadata("design:type", String)
], CreateSectionDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    __metadata("design:type", String)
], CreateSectionDto.prototype, "description", void 0);
class CreateLessonDto {
    title;
    isFreePreview;
    primaryVideoId;
    attachments;
    examId;
    examRules;
    embeddedExamConfig;
    content;
}
exports.CreateLessonDto = CreateLessonDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên bài học không được để trống' }),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateLessonDto.prototype, "isFreePreview", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)({ message: 'primaryVideoId không hợp lệ' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "primaryVideoId", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'attachments phải là một mảng' }),
    (0, class_validator_1.IsMongoId)({ each: true, message: 'ID tệp đính kèm không hợp lệ' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateLessonDto.prototype, "attachments", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)({ message: 'examId không hợp lệ' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "examId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ExamRuleConfigDto),
    __metadata("design:type", ExamRuleConfigDto)
], CreateLessonDto.prototype, "examRules", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => embedded_exam_config_dto_1.EmbeddedExamConfigDto),
    __metadata("design:type", embedded_exam_config_dto_1.EmbeddedExamConfigDto)
], CreateLessonDto.prototype, "embeddedExamConfig", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nội dung/Ghi chú bài học không được để trống' }),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "content", void 0);
class UpdateSectionDto {
    title;
    description;
}
exports.UpdateSectionDto = UpdateSectionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSectionDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    __metadata("design:type", String)
], UpdateSectionDto.prototype, "description", void 0);
class UpdateLessonDto {
    title;
    isFreePreview;
    primaryVideoId;
    attachments;
    examRules;
    examId;
    embeddedExamConfig;
    content;
}
exports.UpdateLessonDto = UpdateLessonDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateLessonDto.prototype, "isFreePreview", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)({ message: 'primaryVideoId không hợp lệ' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "primaryVideoId", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'attachments phải là một mảng' }),
    (0, class_validator_1.IsMongoId)({ each: true, message: 'ID tệp đính kèm không hợp lệ' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateLessonDto.prototype, "attachments", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ExamRuleConfigDto),
    __metadata("design:type", ExamRuleConfigDto)
], UpdateLessonDto.prototype, "examRules", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)({ message: 'examId không hợp lệ' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "examId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => embedded_exam_config_dto_1.EmbeddedExamConfigDto),
    __metadata("design:type", embedded_exam_config_dto_1.EmbeddedExamConfigDto)
], UpdateLessonDto.prototype, "embeddedExamConfig", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nội dung/Ghi chú bài học không được để trống' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "content", void 0);
//# sourceMappingURL=curriculum.dto.js.map