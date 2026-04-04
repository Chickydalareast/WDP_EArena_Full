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
exports.BulkStandardizeQuestionDto = void 0;
const class_validator_1 = require("class-validator");
const question_schema_1 = require("../schemas/question.schema");
class BulkStandardizeQuestionDto {
    questionIds;
    topicId;
    difficultyLevel;
    autoOrganize;
}
exports.BulkStandardizeQuestionDto = BulkStandardizeQuestionDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({
        each: true,
        message: 'Danh sách ID câu hỏi chứa định dạng không hợp lệ.',
    }),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'Phải chọn ít nhất 1 câu hỏi để chuẩn hóa.' }),
    __metadata("design:type", Array)
], BulkStandardizeQuestionDto.prototype, "questionIds", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)({ message: 'ID Chuyên đề (topicId) không hợp lệ.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Bắt buộc chọn Chuyên đề để chuẩn hóa.' }),
    __metadata("design:type", String)
], BulkStandardizeQuestionDto.prototype, "topicId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Object.values(question_schema_1.DifficultyLevel).filter((lvl) => lvl !== question_schema_1.DifficultyLevel.UNKNOWN), {
        message: 'Bắt buộc chọn Mức độ nhận thức hợp lệ (Không được để trống/UNKNOWN).',
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Bắt buộc chọn Mức độ nhận thức.' }),
    __metadata("design:type", String)
], BulkStandardizeQuestionDto.prototype, "difficultyLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BulkStandardizeQuestionDto.prototype, "autoOrganize", void 0);
//# sourceMappingURL=bulk-standardize-question.dto.js.map