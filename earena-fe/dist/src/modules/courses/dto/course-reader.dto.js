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
exports.SearchPublicCoursesDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const course_search_enum_1 = require("../enums/course-search.enum");
class SearchPublicCoursesDto {
    keyword;
    subjectId;
    page;
    limit;
    isFree;
    minPrice;
    maxPrice;
    sort;
}
exports.SearchPublicCoursesDto = SearchPublicCoursesDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchPublicCoursesDto.prototype, "keyword", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ message: 'subjectId phải là định dạng MongoDB ID hợp lệ.' }),
    __metadata("design:type", String)
], SearchPublicCoursesDto.prototype, "subjectId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'page phải là một số.' }),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SearchPublicCoursesDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'limit phải là một số.' }),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SearchPublicCoursesDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true' || value === true || value === 1 || value === '1')
            return true;
        if (value === 'false' || value === false || value === 0 || value === '0')
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SearchPublicCoursesDto.prototype, "isFree", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'minPrice phải là số.' }),
    (0, class_validator_1.Min)(0, { message: 'minPrice không được âm.' }),
    __metadata("design:type", Number)
], SearchPublicCoursesDto.prototype, "minPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'maxPrice phải là số.' }),
    (0, class_validator_1.Min)(0, { message: 'maxPrice không được âm.' }),
    __metadata("design:type", Number)
], SearchPublicCoursesDto.prototype, "maxPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(course_search_enum_1.CourseSortType, {
        message: `sort chỉ chấp nhận các giá trị: ${Object.values(course_search_enum_1.CourseSortType).join(', ')}`,
    }),
    __metadata("design:type", String)
], SearchPublicCoursesDto.prototype, "sort", void 0);
//# sourceMappingURL=course-reader.dto.js.map