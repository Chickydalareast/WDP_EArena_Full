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
exports.CommunityFeedQueryDto = exports.CommunityFeedSort = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const community_constants_1 = require("../constants/community.constants");
var CommunityFeedSort;
(function (CommunityFeedSort) {
    CommunityFeedSort["NEW"] = "NEW";
    CommunityFeedSort["HOT"] = "HOT";
    CommunityFeedSort["FOLLOWING"] = "FOLLOWING";
    CommunityFeedSort["FOR_YOU"] = "FOR_YOU";
})(CommunityFeedSort || (exports.CommunityFeedSort = CommunityFeedSort = {}));
class CommunityFeedQueryDto {
    sort;
    type;
    subjectId;
    courseId;
    examId;
    q;
    limit;
    cursor;
}
exports.CommunityFeedQueryDto = CommunityFeedQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CommunityFeedSort),
    __metadata("design:type", String)
], CommunityFeedQueryDto.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(community_constants_1.CommunityPostType),
    __metadata("design:type", String)
], CommunityFeedQueryDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CommunityFeedQueryDto.prototype, "subjectId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CommunityFeedQueryDto.prototype, "courseId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CommunityFeedQueryDto.prototype, "examId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CommunityFeedQueryDto.prototype, "q", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CommunityFeedQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommunityFeedQueryDto.prototype, "cursor", void 0);
//# sourceMappingURL=community-feed-query.dto.js.map