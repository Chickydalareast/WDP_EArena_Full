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
exports.WalletsController = void 0;
const common_1 = require("@nestjs/common");
const wallets_service_1 = require("./wallets.service");
const wallets_dto_1 = require("./dto/wallets.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const teacher_verified_decorator_1 = require("../../common/decorators/teacher-verified.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const withdraw_dto_1 = require("./dto/withdraw.dto");
let WalletsController = class WalletsController {
    walletsService;
    constructor(walletsService) {
        this.walletsService = walletsService;
    }
    async getMyWallet(userId) {
        const data = await this.walletsService.getMyWallet(userId);
        return { message: 'Lấy thông tin ví thành công', data };
    }
    async getMyTransactions(query, userId) {
        const payload = {
            userId,
            page: query.page || 1,
            limit: query.limit || 10,
        };
        const result = await this.walletsService.getMyTransactions(payload);
        return {
            message: 'Lấy lịch sử giao dịch thành công',
            data: result.data,
            meta: result.meta,
        };
    }
    async mockDeposit(dto, userId) {
        const data = await this.walletsService.mockDeposit({
            userId,
            amount: dto.amount,
        });
        return data;
    }
    async requestWithdrawal(dto, userId) {
        const payload = {
            teacherId: userId,
            amount: dto.amount,
            bankName: dto.bankName,
            accountNumber: dto.accountNumber,
            accountName: dto.accountName,
        };
        return this.walletsService.requestWithdrawal(payload);
    }
};
exports.WalletsController = WalletsController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getMyWallet", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [wallets_dto_1.GetTransactionsDto, String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getMyTransactions", null);
__decorate([
    (0, common_1.Post)('mock-deposit'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [wallets_dto_1.MockDepositDto, String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "mockDeposit", null);
__decorate([
    (0, common_1.Post)('withdraw'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [withdraw_dto_1.CreateWithdrawalDto, String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "requestWithdrawal", null);
exports.WalletsController = WalletsController = __decorate([
    (0, common_1.Controller)('wallets'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, teacher_verified_decorator_1.RequireTeacherVerified)(),
    __metadata("design:paramtypes", [wallets_service_1.WalletsService])
], WalletsController);
//# sourceMappingURL=wallets.controller.js.map