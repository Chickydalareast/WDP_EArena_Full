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
exports.GenerateMatrixDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const question_schema_1 = require("../../questions/schemas/question.schema");
class MatrixCriterionDto {
    folderIds;
    topicId;
    difficulty;
    limit;
}
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], MatrixCriterionDto.prototype, "folderIds", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MatrixCriterionDto.prototype, "topicId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(question_schema_1.DifficultyLevel),
    __metadata("design:type", String)
], MatrixCriterionDto.prototype, "difficulty", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], MatrixCriterionDto.prototype, "limit", void 0);
class GenerateMatrixDto {
    title;
    totalScore;
    criteria;
}
exports.GenerateMatrixDto = GenerateMatrixDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], GenerateMatrixDto.prototype, "title", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GenerateMatrixDto.prototype, "totalScore", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MatrixCriterionDto),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], GenerateMatrixDto.prototype, "criteria", void 0);
//# sourceMappingURL=generate-matrix.dto.js.map