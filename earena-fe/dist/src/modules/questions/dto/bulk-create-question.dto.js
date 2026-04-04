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
exports.BulkCreateQuestionDto = exports.BulkQuestionItemDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const question_schema_1 = require("../schemas/question.schema");
const create_question_dto_1 = require("./create-question.dto");
const no_base64_decorator_1 = require("../../../common/decorators/no-base64.decorator");
class BulkAnswerOptionDto {
    id;
    content;
    isCorrect;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkAnswerOptionDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, no_base64_decorator_1.NoBase64Image)(),
    __metadata("design:type", String)
], BulkAnswerOptionDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BulkAnswerOptionDto.prototype, "isCorrect", void 0);
class BulkSubQuestionDto {
    content;
    explanation;
    difficultyLevel;
    answers;
    attachedMedia;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, no_base64_decorator_1.NoBase64Image)(),
    __metadata("design:type", String)
], BulkSubQuestionDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, no_base64_decorator_1.NoBase64Image)(),
    __metadata("design:type", String)
], BulkSubQuestionDto.prototype, "explanation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(question_schema_1.DifficultyLevel),
    (0, create_question_dto_1.IsRequiredIfPublished)(),
    __metadata("design:type", String)
], BulkSubQuestionDto.prototype, "difficultyLevel", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BulkAnswerOptionDto),
    (0, class_validator_1.ArrayMinSize)(2, { message: 'Câu hỏi trắc nghiệm phải có ít nhất 2 đáp án.' }),
    __metadata("design:type", Array)
], BulkSubQuestionDto.prototype, "answers", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], BulkSubQuestionDto.prototype, "attachedMedia", void 0);
class BulkQuestionItemDto {
    type;
    content;
    explanation;
    topicId;
    difficultyLevel;
    isDraft;
    tags;
    answers;
    subQuestions;
    attachedMedia;
}
exports.BulkQuestionItemDto = BulkQuestionItemDto;
__decorate([
    (0, class_validator_1.IsEnum)(question_schema_1.QuestionType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkQuestionItemDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, no_base64_decorator_1.NoBase64Image)(),
    __metadata("design:type", String)
], BulkQuestionItemDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, no_base64_decorator_1.NoBase64Image)(),
    __metadata("design:type", String)
], BulkQuestionItemDto.prototype, "explanation", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ message: 'ID Chuyên đề không hợp lệ.' }),
    (0, create_question_dto_1.IsRequiredIfPublished)(),
    __metadata("design:type", String)
], BulkQuestionItemDto.prototype, "topicId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(question_schema_1.DifficultyLevel),
    (0, create_question_dto_1.IsRequiredIfPublished)(),
    __metadata("design:type", String)
], BulkQuestionItemDto.prototype, "difficultyLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BulkQuestionItemDto.prototype, "isDraft", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BulkQuestionItemDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.type !== question_schema_1.QuestionType.PASSAGE),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BulkAnswerOptionDto),
    (0, class_validator_1.ArrayMinSize)(2, { message: 'Câu hỏi trắc nghiệm phải có ít nhất 2 đáp án.' }),
    __metadata("design:type", Array)
], BulkQuestionItemDto.prototype, "answers", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.type === question_schema_1.QuestionType.PASSAGE),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BulkSubQuestionDto),
    __metadata("design:type", Array)
], BulkQuestionItemDto.prototype, "subQuestions", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ each: true, message: 'Định dạng ID Media không hợp lệ.' }),
    __metadata("design:type", Array)
], BulkQuestionItemDto.prototype, "attachedMedia", void 0);
class BulkCreateQuestionDto {
    folderId;
    questions;
}
exports.BulkCreateQuestionDto = BulkCreateQuestionDto;
__decorate([
    (0, class_validator_1.IsMongoId)({ message: 'ID thư mục không hợp lệ.' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkCreateQuestionDto.prototype, "folderId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BulkQuestionItemDto),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'Bắt buộc phải truyền ít nhất 1 câu hỏi.' }),
    __metadata("design:type", Array)
], BulkCreateQuestionDto.prototype, "questions", void 0);
//# sourceMappingURL=bulk-create-question.dto.js.map