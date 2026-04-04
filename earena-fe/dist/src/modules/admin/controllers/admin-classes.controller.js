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
exports.AdminClassesController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const admin_service_1 = require("../admin.service");
const admin_classes_dto_1 = require("../dto/admin-classes.dto");
const user_role_enum_1 = require("../../../common/enums/user-role.enum");
let AdminClassesController = class AdminClassesController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async list(query) {
        return this.adminService.listClasses({
            page: query.page || 1,
            limit: query.limit || 20,
            search: query.search,
            teacherId: query.teacherId,
        });
    }
    async setLock(id, dto) {
        return this.adminService.setClassLocked(id, dto.isLocked);
    }
    async delete(id) {
        return this.adminService.deleteClass(id);
    }
};
exports.AdminClassesController = AdminClassesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_classes_dto_1.AdminListClassesQueryDto]),
    __metadata("design:returntype", Promise)
], AdminClassesController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)(':id/lock'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_classes_dto_1.AdminSetClassLockDto]),
    __metadata("design:returntype", Promise)
], AdminClassesController.prototype, "setLock", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminClassesController.prototype, "delete", null);
exports.AdminClassesController = AdminClassesController = __decorate([
    (0, common_1.Controller)('admin/classes'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminClassesController);
//# sourceMappingURL=admin-classes.controller.js.map