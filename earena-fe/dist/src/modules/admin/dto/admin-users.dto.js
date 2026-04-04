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
exports.AdminResetPasswordDto = exports.AdminUpdateUserStatusDto = exports.AdminUpdateUserRoleDto = exports.AdminCreateUserDto = exports.AdminListUsersQueryDto = void 0;
const class_validator_1 = require("class-validator");
const pagination_dto_1 = require("./pagination.dto");
const user_schema_1 = require("../../users/schemas/user.schema");
const user_role_enum_1 = require("../../../common/enums/user-role.enum");
class AdminListUsersQueryDto extends pagination_dto_1.PaginationQueryDto {
    search;
    role;
    status;
}
exports.AdminListUsersQueryDto = AdminListUsersQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminListUsersQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_role_enum_1.UserRole),
    __metadata("design:type", String)
], AdminListUsersQueryDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_schema_1.UserStatus),
    __metadata("design:type", String)
], AdminListUsersQueryDto.prototype, "status", void 0);
class AdminCreateUserDto {
    email;
    fullName;
    password;
    role;
    status;
}
exports.AdminCreateUserDto = AdminCreateUserDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], AdminCreateUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminCreateUserDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], AdminCreateUserDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(user_role_enum_1.UserRole),
    __metadata("design:type", String)
], AdminCreateUserDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_schema_1.UserStatus),
    __metadata("design:type", String)
], AdminCreateUserDto.prototype, "status", void 0);
class AdminUpdateUserRoleDto {
    role;
}
exports.AdminUpdateUserRoleDto = AdminUpdateUserRoleDto;
__decorate([
    (0, class_validator_1.IsEnum)(user_role_enum_1.UserRole),
    __metadata("design:type", String)
], AdminUpdateUserRoleDto.prototype, "role", void 0);
class AdminUpdateUserStatusDto {
    status;
}
exports.AdminUpdateUserStatusDto = AdminUpdateUserStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(user_schema_1.UserStatus),
    __metadata("design:type", String)
], AdminUpdateUserStatusDto.prototype, "status", void 0);
class AdminResetPasswordDto {
    newPassword;
}
exports.AdminResetPasswordDto = AdminResetPasswordDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], AdminResetPasswordDto.prototype, "newPassword", void 0);
//# sourceMappingURL=admin-users.dto.js.map