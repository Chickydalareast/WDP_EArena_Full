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
exports.SetUserCommunityStatusDto = exports.ResolveCommunityReportDto = void 0;
const class_validator_1 = require("class-validator");
const community_constants_1 = require("../constants/community.constants");
const community_constants_2 = require("../constants/community.constants");
class ResolveCommunityReportDto {
    status;
    resolutionNote;
}
exports.ResolveCommunityReportDto = ResolveCommunityReportDto;
__decorate([
    (0, class_validator_1.IsEnum)(community_constants_1.CommunityReportStatus),
    __metadata("design:type", String)
], ResolveCommunityReportDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], ResolveCommunityReportDto.prototype, "resolutionNote", void 0);
class SetUserCommunityStatusDto {
    communityStatus;
    mutedUntil;
    moderationNote;
}
exports.SetUserCommunityStatusDto = SetUserCommunityStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(community_constants_2.CommunityUserCommunityStatus),
    __metadata("design:type", String)
], SetUserCommunityStatusDto.prototype, "communityStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SetUserCommunityStatusDto.prototype, "mutedUntil", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], SetUserCommunityStatusDto.prototype, "moderationNote", void 0);
//# sourceMappingURL=community-admin.dto.js.map