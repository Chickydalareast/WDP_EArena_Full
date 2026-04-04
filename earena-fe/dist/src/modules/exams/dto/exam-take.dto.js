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
exports.GetLessonAttemptsQueryDto = exports.GetLessonAttemptsParamDto = exports.GetStudentHistoryOverviewDto = exports.GetStudentHistoryDto = exports.AutoSaveDto = exports.StartExamDto = void 0;
const class_validator_1 = require("class-validator");
const pagination_dto_1 = require("../../../common/dto/pagination.dto");
class StartExamDto {
    courseId;
    lessonId;
}
exports.StartExamDto = StartExamDto;
__decorate([
    (0, class_validator_1.IsMongoId)({ message: 'courseId không hợp lệ.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Phải cung cấp courseId.' }),
    __metadata("design:type", String)
], StartExamDto.prototype, "courseId", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)({ message: 'lessonId không hợp lệ.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Phải cung cấp lessonId.' }),
    __metadata("design:type", String)
], StartExamDto.prototype, "lessonId", void 0);
class AutoSaveDto {
    questionId;
    selectedAnswerId;
}
exports.AutoSaveDto = AutoSaveDto;
__decorate([
    (0, class_validator_1.IsMongoId)({ message: 'questionId không hợp lệ.' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AutoSaveDto.prototype, "questionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AutoSaveDto.prototype, "selectedAnswerId", void 0);
class GetStudentHistoryDto extends pagination_dto_1.PaginationDto {
    courseId;
    lessonId;
}
exports.GetStudentHistoryDto = GetStudentHistoryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ message: 'courseId không hợp lệ.' }),
    __metadata("design:type", String)
], GetStudentHistoryDto.prototype, "courseId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ message: 'lessonId không hợp lệ.' }),
    __metadata("design:type", String)
], GetStudentHistoryDto.prototype, "lessonId", void 0);
class GetStudentHistoryOverviewDto extends pagination_dto_1.PaginationDto {
    courseId;
}
exports.GetStudentHistoryOverviewDto = GetStudentHistoryOverviewDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ message: 'courseId không hợp lệ.' }),
    __metadata("design:type", String)
], GetStudentHistoryOverviewDto.prototype, "courseId", void 0);
class GetLessonAttemptsParamDto {
    lessonId;
}
exports.GetLessonAttemptsParamDto = GetLessonAttemptsParamDto;
__decorate([
    (0, class_validator_1.IsMongoId)({ message: 'lessonId không hợp lệ.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Phải cung cấp lessonId.' }),
    __metadata("design:type", String)
], GetLessonAttemptsParamDto.prototype, "lessonId", void 0);
class GetLessonAttemptsQueryDto extends pagination_dto_1.PaginationDto {
}
exports.GetLessonAttemptsQueryDto = GetLessonAttemptsQueryDto;
//# sourceMappingURL=exam-take.dto.js.map