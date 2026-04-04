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
var WalletNotificationListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletNotificationListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const notifications_service_1 = require("../notifications.service");
const notification_event_constant_1 = require("../constants/notification-event.constant");
const wallet_event_constant_1 = require("../../wallets/constants/wallet-event.constant");
const users_repository_1 = require("../../users/users.repository");
const user_role_enum_1 = require("../../../common/enums/user-role.enum");
let WalletNotificationListener = WalletNotificationListener_1 = class WalletNotificationListener {
    notificationsService;
    usersRepo;
    logger = new common_1.Logger(WalletNotificationListener_1.name);
    constructor(notificationsService, usersRepo) {
        this.notificationsService = notificationsService;
        this.usersRepo = usersRepo;
    }
    async handleDepositSuccess(payload) {
        try {
            const amountFormatted = payload.amount.toLocaleString('vi-VN');
            const balanceFormatted = payload.newBalance.toLocaleString('vi-VN');
            await this.notificationsService.createAndDispatch({
                receiverId: payload.userId,
                type: notification_event_constant_1.NotificationType.FINANCE,
                title: 'Nạp tiền thành công! 💳',
                message: `Ví của bạn vừa được cộng ${amountFormatted} Coin. Số dư hiện tại: ${balanceFormatted} Coin.`,
                payload: { url: '/student/wallet' },
            });
        }
        catch (error) {
            this.logger.error(`[Listener Error] DEPOSIT_SUCCESS: ${error.message}`, error.stack);
        }
    }
    async handleWithdrawalRequested(payload) {
        try {
            const teacher = await this.usersRepo.findByIdSafe(payload.teacherId, {
                select: 'fullName',
            });
            const teacherName = teacher ? teacher.fullName : 'Một giáo viên';
            const amountFormatted = payload.amount.toLocaleString('vi-VN');
            await this.notificationsService.createAndDispatch({
                receiverId: payload.teacherId,
                type: notification_event_constant_1.NotificationType.FINANCE,
                title: 'Đã tạo lệnh rút tiền ⏳',
                message: `Yêu cầu rút ${amountFormatted} VNĐ của bạn đang được hệ thống xử lý.`,
                payload: { requestId: payload.requestId, url: '/teacher/wallet' },
            });
            const admins = await this.usersRepo.modelInstance
                .find({ role: user_role_enum_1.UserRole.ADMIN })
                .select('_id')
                .lean()
                .exec();
            if (!admins.length)
                return;
            await Promise.all(admins.map((admin) => this.notificationsService.createAndDispatch({
                receiverId: admin._id.toString(),
                type: notification_event_constant_1.NotificationType.FINANCE,
                title: 'Yêu cầu rút tiền mới! ⚠️',
                message: `Giáo viên ${teacherName} vừa đặt lệnh rút ${amountFormatted} VNĐ. Vui lòng đối soát.`,
                payload: {
                    requestId: payload.requestId,
                    url: '/admin/withdrawals',
                },
            })));
        }
        catch (error) {
            this.logger.error(`[Listener Error] WITHDRAWAL_REQUESTED: ${error.message}`, error.stack);
        }
    }
    async handleWithdrawalApproved(payload) {
        try {
            const amountFormatted = payload.amount.toLocaleString('vi-VN');
            await this.notificationsService.createAndDispatch({
                receiverId: payload.teacherId,
                type: notification_event_constant_1.NotificationType.FINANCE,
                title: 'Rút tiền thành công! 💸',
                message: `Yêu cầu rút ${amountFormatted} VNĐ của bạn đã được duyệt và chuyển khoản thành công.`,
                payload: { requestId: payload.requestId, url: '/teacher/wallet' },
            });
        }
        catch (error) {
            this.logger.error(`[Listener Error] WITHDRAWAL_APPROVED: ${error.message}`, error.stack);
        }
    }
    async handleWithdrawalRejected(payload) {
        try {
            const amountFormatted = payload.amount.toLocaleString('vi-VN');
            await this.notificationsService.createAndDispatch({
                receiverId: payload.teacherId,
                type: notification_event_constant_1.NotificationType.SYSTEM,
                title: 'Rút tiền thất bại ❌',
                message: `Yêu cầu rút ${amountFormatted} VNĐ của bạn bị từ chối. Lý do: ${payload.reason}. Số tiền đã được hoàn lại vào ví.`,
                payload: { requestId: payload.requestId, url: '/teacher/wallet' },
            });
        }
        catch (error) {
            this.logger.error(`[Listener Error] WITHDRAWAL_REJECTED: ${error.message}`, error.stack);
        }
    }
};
exports.WalletNotificationListener = WalletNotificationListener;
__decorate([
    (0, event_emitter_1.OnEvent)(wallet_event_constant_1.WalletEventPattern.DEPOSIT_SUCCESS, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletNotificationListener.prototype, "handleDepositSuccess", null);
__decorate([
    (0, event_emitter_1.OnEvent)(wallet_event_constant_1.WalletEventPattern.WITHDRAWAL_REQUESTED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletNotificationListener.prototype, "handleWithdrawalRequested", null);
__decorate([
    (0, event_emitter_1.OnEvent)(wallet_event_constant_1.WalletEventPattern.WITHDRAWAL_APPROVED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletNotificationListener.prototype, "handleWithdrawalApproved", null);
__decorate([
    (0, event_emitter_1.OnEvent)(wallet_event_constant_1.WalletEventPattern.WITHDRAWAL_REJECTED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletNotificationListener.prototype, "handleWithdrawalRejected", null);
exports.WalletNotificationListener = WalletNotificationListener = WalletNotificationListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        users_repository_1.UsersRepository])
], WalletNotificationListener);
//# sourceMappingURL=wallet-notification.listener.js.map