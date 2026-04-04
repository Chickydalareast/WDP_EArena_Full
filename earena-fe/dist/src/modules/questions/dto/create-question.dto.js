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
exports.CreateQuestionDto = void 0;
exports.IsRequiredIfPublished = IsRequiredIfPublished;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const question_schema_1 = require("../schemas/question.schema");
const no_base64_decorator_1 = require("../../../common/decorators/no-base64.decorator");
function IsRequiredIfPublished(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isRequiredIfPublished',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value, args) {
                    const { isDraft } = args.object;
                    if (isDraft === true || isDraft === undefined) {
                        return true;
                    }
                    if (propertyName === 'topicId') {
                        return typeof value === 'string' && value.trim().length > 0;
                    }
                    if (propertyName === 'difficultyLevel') {
                        return (value !== undefined &&
                            value !== null &&
                            value !== question_schema_1.DifficultyLevel.UNKNOWN);
                    }
                    return true;
                },
                defaultMessage(args) {
                    if (args.property === 'difficultyLevel') {
                        return 'Bắt buộc chọn Mức độ học thuật (khác UNKNOWN) khi Xuất bản câu hỏi.';
                    }
                    return `Bắt buộc chọn Chuyên đề (topicId) khi Xuất bản câu hỏi.`;
                },
            },
        });
    };
}
class AnswerOptionDto {
    id;
    content;
    isCorrect;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AnswerOptionDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, no_base64_decorator_1.NoBase64Image)(),
    __metadata("design:type", String)
], AnswerOptionDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AnswerOptionDto.prototype, "isCorrect", void 0);
class CreateQuestionDto {
    topicId;
    folderId;
    type;
    difficultyLevel;
    content;
    explanation;
    orderIndex;
    answers;
    parentPassageId;
    tags;
    isDraft;
    attachedMedia;
}
exports.CreateQuestionDto = CreateQuestionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ message: 'Định dạng ID Chuyên đề không hợp lệ.' }),
    IsRequiredIfPublished(),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "topicId", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "folderId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(question_schema_1.QuestionType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(question_schema_1.DifficultyLevel),
    IsRequiredIfPublished(),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "difficultyLevel", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, no_base64_decorator_1.NoBase64Image)(),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, no_base64_decorator_1.NoBase64Image)(),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "explanation", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateQuestionDto.prototype, "orderIndex", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.type !== question_schema_1.QuestionType.PASSAGE),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AnswerOptionDto),
    (0, class_validator_1.ArrayMinSize)(2, { message: 'Câu hỏi trắc nghiệm phải có ít nhất 2 đáp án.' }),
    __metadata("design:type", Array)
], CreateQuestionDto.prototype, "answers", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "parentPassageId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateQuestionDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateQuestionDto.prototype, "isDraft", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ each: true, message: 'Định dạng ID tệp đính kèm không hợp lệ.' }),
    __metadata("design:type", Array)
], CreateQuestionDto.prototype, "attachedMedia", void 0);
//# sourceMappingURL=create-question.dto.js.map