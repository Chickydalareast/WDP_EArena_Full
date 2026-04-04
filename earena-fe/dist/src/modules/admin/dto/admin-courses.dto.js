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
exports.ForceTakedownCourseDto = exports.GetAdminCoursesDto = exports.GetPendingCoursesDto = exports.RejectCourseDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const course_schema_1 = require("../../courses/schemas/course.schema");
class RejectCourseDto {
    reason;
}
exports.RejectCourseDto = RejectCourseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Vui lòng cung cấp lý do từ chối khóa học.' }),
    __metadata("design:type", String)
], RejectCourseDto.prototype, "reason", void 0);
class GetPendingCoursesDto {
    page = 1;
    limit = 10;
}
exports.GetPendingCoursesDto = GetPendingCoursesDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetPendingCoursesDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetPendingCoursesDto.prototype, "limit", void 0);
class GetAdminCoursesDto {
    page = 1;
    limit = 10;
    search;
    status;
    teacherId;
}
exports.GetAdminCoursesDto = GetAdminCoursesDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetAdminCoursesDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetAdminCoursesDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetAdminCoursesDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(course_schema_1.CourseStatus, { message: 'Trạng thái khóa học không hợp lệ.' }),
    __metadata("design:type", String)
], GetAdminCoursesDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ message: 'Teacher ID không hợp lệ.' }),
    __metadata("design:type", String)
], GetAdminCoursesDto.prototype, "teacherId", void 0);
class ForceTakedownCourseDto {
    reason;
}
exports.ForceTakedownCourseDto = ForceTakedownCourseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Thao tác gỡ khẩn cấp bắt buộc phải có lý do cụ thể.' }),
    __metadata("design:type", String)
], ForceTakedownCourseDto.prototype, "reason", void 0);
//# sourceMappingURL=admin-courses.dto.js.map