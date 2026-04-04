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
exports.UpdatePassageDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const question_schema_1 = require("../schemas/question.schema");
const create_question_dto_1 = require("./create-question.dto");
const no_base64_decorator_1 = require("../../../common/decorators/no-base64.decorator");
class UpdatePassageAnswerOptionDto {
    id;
    content;
    isCorrect;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdatePassageAnswerOptionDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, no_base64_decorator_1.NoBase64Image)(),
    __metadata("design:type", String)
], UpdatePassageAnswerOptionDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePassageAnswerOptionDto.prototype, "isCorrect", void 0);
class UpdatePassageSubQuestionDto {
    id;
    content;
    explanation;
    difficultyLevel;
    answers;
    attachedMedia;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], UpdatePassageSubQuestionDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, no_base64_decorator_1.NoBase64Image)(),
    __metadata("design:type", String)
], UpdatePassageSubQuestionDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, no_base64_decorator_1.NoBase64Image)(),
    __metadata("design:type", String)
], UpdatePassageSubQuestionDto.prototype, "explanation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(question_schema_1.DifficultyLevel),
    (0, create_question_dto_1.IsRequiredIfPublished)(),
    __metadata("design:type", String)
], UpdatePassageSubQuestionDto.prototype, "difficultyLevel", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => UpdatePassageAnswerOptionDto),
    __metadata("design:type", Array)
], UpdatePassageSubQuestionDto.prototype, "answers", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], UpdatePassageSubQuestionDto.prototype, "attachedMedia", void 0);
class UpdatePassageDto {
    content;
    explanation;
    topicId;
    difficultyLevel;
    tags;
    subQuestions;
    attachedMedia;
    isDraft;
}
exports.UpdatePassageDto = UpdatePassageDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, no_base64_decorator_1.NoBase64Image)(),
    __metadata("design:type", String)
], UpdatePassageDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, no_base64_decorator_1.NoBase64Image)(),
    __metadata("design:type", String)
], UpdatePassageDto.prototype, "explanation", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ message: 'ID Chuyên đề không hợp lệ.' }),
    (0, create_question_dto_1.IsRequiredIfPublished)(),
    __metadata("design:type", String)
], UpdatePassageDto.prototype, "topicId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(question_schema_1.DifficultyLevel),
    (0, create_question_dto_1.IsRequiredIfPublished)(),
    __metadata("design:type", String)
], UpdatePassageDto.prototype, "difficultyLevel", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdatePassageDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => UpdatePassageSubQuestionDto),
    __metadata("design:type", Array)
], UpdatePassageDto.prototype, "subQuestions", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], UpdatePassageDto.prototype, "attachedMedia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePassageDto.prototype, "isDraft", void 0);
//# sourceMappingURL=update-passage.dto.js.map