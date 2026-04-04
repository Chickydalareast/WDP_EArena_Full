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
exports.UpdatePaperPointsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class PointDataDto {
    questionId;
    points;
}
__decorate([
    (0, class_validator_1.IsMongoId)({ message: 'ID câu hỏi không hợp lệ.' }),
    __metadata("design:type", String)
], PointDataDto.prototype, "questionId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'Điểm số phải là định dạng số.' }),
    (0, class_validator_1.Min)(0, { message: 'Điểm số không được âm.' }),
    __metadata("design:type", Number)
], PointDataDto.prototype, "points", void 0);
class UpdatePaperPointsDto {
    divideEqually;
    pointsData;
}
exports.UpdatePaperPointsDto = UpdatePaperPointsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Cờ chia đều điểm phải là kiểu boolean.' }),
    __metadata("design:type", Boolean)
], UpdatePaperPointsDto.prototype, "divideEqually", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Dữ liệu điểm phải là một mảng.' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PointDataDto),
    __metadata("design:type", Array)
], UpdatePaperPointsDto.prototype, "pointsData", void 0);
//# sourceMappingURL=update-paper-points.dto.js.map