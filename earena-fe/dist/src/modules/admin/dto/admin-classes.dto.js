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
exports.AdminSetClassLockDto = exports.AdminListClassesQueryDto = void 0;
const class_validator_1 = require("class-validator");
const pagination_dto_1 = require("./pagination.dto");
class AdminListClassesQueryDto extends pagination_dto_1.PaginationQueryDto {
    search;
    teacherId;
}
exports.AdminListClassesQueryDto = AdminListClassesQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminListClassesQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], AdminListClassesQueryDto.prototype, "teacherId", void 0);
class AdminSetClassLockDto {
    isLocked;
}
exports.AdminSetClassLockDto = AdminSetClassLockDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AdminSetClassLockDto.prototype, "isLocked", void 0);
//# sourceMappingURL=admin-classes.dto.js.map