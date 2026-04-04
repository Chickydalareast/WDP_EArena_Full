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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUsersController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const admin_service_1 = require("../admin.service");
const admin_users_dto_1 = require("../dto/admin-users.dto");
const user_role_enum_1 = require("../../../common/enums/user-role.enum");
let AdminUsersController = class AdminUsersController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async list(query) {
        return this.adminService.listUsers({
            page: query.page || 1,
            limit: query.limit || 20,
            search: query.search,
            role: query.role,
            status: query.status,
        });
    }
    async create(dto) {
        return this.adminService.createUser(dto);
    }
    async updateRole(id, dto) {
        return this.adminService.updateUserRole(id, dto.role);
    }
    async updateStatus(id, dto) {
        return this.adminService.updateUserStatus(id, dto.status);
    }
    async resetPassword(id, dto) {
        return this.adminService.resetUserPassword(id, dto.newPassword);
    }
    async deactivate(id) {
        return this.adminService.deactivateUser(id);
    }
};
exports.AdminUsersController = AdminUsersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_users_dto_1.AdminListUsersQueryDto]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_users_dto_1.AdminCreateUserDto]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/role'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_users_dto_1.AdminUpdateUserRoleDto]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_users_dto_1.AdminUpdateUserStatusDto]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/reset-password'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_users_dto_1.AdminResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "deactivate", null);
exports.AdminUsersController = AdminUsersController = __decorate([
    (0, common_1.Controller)('admin/users'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminUsersController);
//# sourceMappingURL=admin-users.controller.js.map