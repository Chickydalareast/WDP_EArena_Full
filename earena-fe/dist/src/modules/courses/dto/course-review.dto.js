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
exports.ReplyCourseReviewDto = exports.CreateCourseReviewDto = void 0;
const class_validator_1 = require("class-validator");
class CreateCourseReviewDto {
    rating;
    comment;
}
exports.CreateCourseReviewDto = CreateCourseReviewDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1, { message: 'Đánh giá thấp nhất là 1 sao' }),
    (0, class_validator_1.Max)(5, { message: 'Đánh giá cao nhất là 5 sao' }),
    __metadata("design:type", Number)
], CreateCourseReviewDto.prototype, "rating", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCourseReviewDto.prototype, "comment", void 0);
class ReplyCourseReviewDto {
    reply;
}
exports.ReplyCourseReviewDto = ReplyCourseReviewDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Nội dung phản hồi phải là chuỗi văn bản' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nội dung phản hồi không được để trống' }),
    __metadata("design:type", String)
], ReplyCourseReviewDto.prototype, "reply", void 0);
//# sourceMappingURL=course-review.dto.js.map