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
exports.AdminPricingController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const admin_service_1 = require("../admin.service");
const admin_pricing_dto_1 = require("../dto/admin-pricing.dto");
const user_role_enum_1 = require("../../../common/enums/user-role.enum");
let AdminPricingController = class AdminPricingController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async list() {
        return this.adminService.listPricingPlans();
    }
    async create(dto) {
        return this.adminService.createPricingPlan(dto);
    }
    async update(id, dto) {
        return this.adminService.updatePricingPlan(id, dto);
    }
};
exports.AdminPricingController = AdminPricingController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminPricingController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_pricing_dto_1.AdminCreatePricingPlanDto]),
    __metadata("design:returntype", Promise)
], AdminPricingController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_pricing_dto_1.AdminUpdatePricingPlanDto]),
    __metadata("design:returntype", Promise)
], AdminPricingController.prototype, "update", null);
exports.AdminPricingController = AdminPricingController = __decorate([
    (0, common_1.Controller)('admin/pricing-plans'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminPricingController);
//# sourceMappingURL=admin-pricing.controller.js.map