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
exports.AdminBusinessController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const admin_service_1 = require("../admin.service");
const admin_business_dto_1 = require("../dto/admin-business.dto");
const user_role_enum_1 = require("../../../common/enums/user-role.enum");
let AdminBusinessController = class AdminBusinessController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async metrics(query) {
        return this.adminService.getBusinessMetrics({ from: query.from, to: query.to });
    }
};
exports.AdminBusinessController = AdminBusinessController;
__decorate([
    (0, common_1.Get)('metrics'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_business_dto_1.AdminBusinessMetricsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminBusinessController.prototype, "metrics", null);
exports.AdminBusinessController = AdminBusinessController = __decorate([
    (0, common_1.Controller)('admin/business'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminBusinessController);
//# sourceMappingURL=admin-business.controller.js.map