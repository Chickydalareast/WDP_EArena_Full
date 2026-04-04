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
exports.AdminWalletsController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const user_role_enum_1 = require("../../../common/enums/user-role.enum");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const wallets_service_1 = require("../../wallets/wallets.service");
const withdraw_dto_1 = require("../../wallets/dto/withdraw.dto");
const admin_wallets_dto_1 = require("../dto/admin-wallets.dto");
let AdminWalletsController = class AdminWalletsController {
    walletsService;
    constructor(walletsService) {
        this.walletsService = walletsService;
    }
    async getWithdrawalRequests(query) {
        const payload = {
            status: query.status,
            page: query.page ?? 1,
            limit: query.limit ?? 10,
        };
        const data = await this.walletsService.getWithdrawalRequestsForAdmin(payload);
        return {
            message: 'Lấy danh sách yêu cầu rút tiền thành công.',
            data: data.items,
            meta: data.meta,
        };
    }
    async processWithdrawal(id, dto, adminId) {
        const payload = {
            requestId: id,
            adminId,
            action: dto.action,
            rejectionReason: dto.rejectionReason,
        };
        return this.walletsService.processWithdrawalRequest(payload);
    }
};
exports.AdminWalletsController = AdminWalletsController;
__decorate([
    (0, common_1.Get)('withdrawals'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_wallets_dto_1.AdminGetWithdrawalsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminWalletsController.prototype, "getWithdrawalRequests", null);
__decorate([
    (0, common_1.Patch)('withdrawals/:id/process'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, withdraw_dto_1.ProcessWithdrawalDto, String]),
    __metadata("design:returntype", Promise)
], AdminWalletsController.prototype, "processWithdrawal", null);
exports.AdminWalletsController = AdminWalletsController = __decorate([
    (0, common_1.Controller)('admin/wallets'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [wallets_service_1.WalletsService])
], AdminWalletsController);
//# sourceMappingURL=admin-wallets.controller.js.map