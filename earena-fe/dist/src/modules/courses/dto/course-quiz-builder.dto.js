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
exports.PreviewQuizConfigDto = exports.RulePreviewDto = exports.GetQuizMatricesDto = exports.DeleteCourseQuizDto = exports.UpdateCourseQuizDto = exports.CreateCourseQuizDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const mapped_types_1 = require("@nestjs/mapped-types");
const question_schema_1 = require("../../questions/schemas/question.schema");
const lesson_schema_1 = require("../schemas/lesson.schema");
let MutuallyExclusiveMatrixSourceConstraint = class MutuallyExclusiveMatrixSourceConstraint {
    validate(_value, args) {
        const obj = args.object;
        const hasMatrix = !!obj.matrixId;
        const hasAdHoc = Array.isArray(obj.adHocSections) && obj.adHocSections.length > 0;
        return !(hasMatrix && hasAdHoc);
    }
    defaultMessage() {
        return 'Chỉ được chọn một trong hai nguồn: "matrixId" (dùng Khuôn mẫu có sẵn) HOẶC "adHocSections" (tự định nghĩa). Không được dùng cả hai cùng lúc.';
    }
};
MutuallyExclusiveMatrixSourceConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'MutuallyExclusiveMatrixSource', async: false })
], MutuallyExclusiveMatrixSourceConstraint);
class DynamicFilterDto {
    difficulty;
    count;
}
__decorate([
    (0, class_validator_1.IsEnum)(question_schema_1.DifficultyLevel),
    __metadata("design:type", String)
], DynamicFilterDto.prototype, "difficulty", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], DynamicFilterDto.prototype, "count", void 0);
class MatrixRuleDto {
    folderIds;
    topicIds;
    difficulties;
    tags;
    limit;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], MatrixRuleDto.prototype, "folderIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], MatrixRuleDto.prototype, "topicIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(question_schema_1.DifficultyLevel, { each: true }),
    __metadata("design:type", Array)
], MatrixRuleDto.prototype, "difficulties", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], MatrixRuleDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], MatrixRuleDto.prototype, "limit", void 0);
class MatrixSectionDto {
    name;
    orderIndex;
    rules;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MatrixSectionDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], MatrixSectionDto.prototype, "orderIndex", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MatrixRuleDto),
    __metadata("design:type", Array)
], MatrixSectionDto.prototype, "rules", void 0);
function IsMatrixSourceMutuallyExclusive() {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isMatrixSourceMutuallyExclusive',
            target: object.constructor,
            propertyName,
            validator: {
                validate(_value, args) {
                    const obj = args.object;
                    const hasMatrix = !!obj.matrixId;
                    const hasAdHoc = Array.isArray(obj.adHocSections) && obj.adHocSections.length > 0;
                    return !(hasMatrix && hasAdHoc);
                },
                defaultMessage() {
                    return 'Chỉ được chọn một nguồn: "matrixId" (Khuôn mẫu có sẵn) HOẶC "adHocSections" (tự định nghĩa). Không được dùng cả hai cùng lúc.';
                },
            },
        });
    };
}
class DynamicExamConfigDto {
    sourceFolders;
    mixRatio;
    matrixId;
    adHocSections;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], DynamicExamConfigDto.prototype, "sourceFolders", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DynamicFilterDto),
    __metadata("design:type", Array)
], DynamicExamConfigDto.prototype, "mixRatio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    IsMatrixSourceMutuallyExclusive(),
    __metadata("design:type", String)
], DynamicExamConfigDto.prototype, "matrixId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MatrixSectionDto),
    __metadata("design:type", Array)
], DynamicExamConfigDto.prototype, "adHocSections", void 0);
class ExamRuleConfigDto {
    timeLimit;
    maxAttempts;
    passPercentage;
    showResultMode;
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ExamRuleConfigDto.prototype, "timeLimit", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ExamRuleConfigDto.prototype, "maxAttempts", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ExamRuleConfigDto.prototype, "passPercentage", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(lesson_schema_1.ShowResultMode),
    __metadata("design:type", String)
], ExamRuleConfigDto.prototype, "showResultMode", void 0);
class CreateCourseQuizDto {
    courseId;
    sectionId;
    title;
    content = '';
    isFreePreview = false;
    totalScore = 100;
    dynamicConfig;
    examRules;
}
exports.CreateCourseQuizDto = CreateCourseQuizDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateCourseQuizDto.prototype, "courseId", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateCourseQuizDto.prototype, "sectionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourseQuizDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCourseQuizDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCourseQuizDto.prototype, "isFreePreview", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCourseQuizDto.prototype, "totalScore", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DynamicExamConfigDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", DynamicExamConfigDto)
], CreateCourseQuizDto.prototype, "dynamicConfig", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ExamRuleConfigDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", ExamRuleConfigDto)
], CreateCourseQuizDto.prototype, "examRules", void 0);
class UpdateCourseQuizDto extends (0, mapped_types_1.PartialType)((0, mapped_types_1.OmitType)(CreateCourseQuizDto, ['courseId', 'sectionId'])) {
    courseId;
    lessonId;
}
exports.UpdateCourseQuizDto = UpdateCourseQuizDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateCourseQuizDto.prototype, "courseId", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateCourseQuizDto.prototype, "lessonId", void 0);
class DeleteCourseQuizDto {
    courseId;
    lessonId;
}
exports.DeleteCourseQuizDto = DeleteCourseQuizDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DeleteCourseQuizDto.prototype, "courseId", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DeleteCourseQuizDto.prototype, "lessonId", void 0);
class GetQuizMatricesDto {
    courseId;
    page = 1;
    limit = 10;
    search;
}
exports.GetQuizMatricesDto = GetQuizMatricesDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetQuizMatricesDto.prototype, "courseId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], GetQuizMatricesDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], GetQuizMatricesDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetQuizMatricesDto.prototype, "search", void 0);
class RulePreviewDto {
    folderIds;
    topicIds;
    difficulties;
    tags;
    limit;
}
exports.RulePreviewDto = RulePreviewDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], RulePreviewDto.prototype, "folderIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], RulePreviewDto.prototype, "topicIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(question_schema_1.DifficultyLevel, { each: true }),
    __metadata("design:type", Array)
], RulePreviewDto.prototype, "difficulties", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], RulePreviewDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], RulePreviewDto.prototype, "limit", void 0);
class PreviewQuizConfigDto {
    matrixId;
    adHocSections;
}
exports.PreviewQuizConfigDto = PreviewQuizConfigDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    IsMatrixSourceMutuallyExclusive(),
    __metadata("design:type", String)
], PreviewQuizConfigDto.prototype, "matrixId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MatrixSectionDto),
    __metadata("design:type", Array)
], PreviewQuizConfigDto.prototype, "adHocSections", void 0);
//# sourceMappingURL=course-quiz-builder.dto.js.map