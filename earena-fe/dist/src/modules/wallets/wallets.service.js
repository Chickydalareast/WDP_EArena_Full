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
var WalletsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("mongoose");
const event_emitter_1 = require("@nestjs/event-emitter");
const wallets_repository_1 = require("./wallets.repository");
const wallet_transactions_repository_1 = require("./wallet-transactions.repository");
const wallet_transaction_schema_1 = require("./schemas/wallet-transaction.schema");
const withdrawal_requests_repository_1 = require("./withdrawal-requests.repository");
const withdrawal_request_schema_1 = require("./schemas/withdrawal-request.schema");
const users_repository_1 = require("../users/users.repository");
const mail_service_1 = require("../mail/mail.service");
const wallet_event_constant_1 = require("./constants/wallet-event.constant");
let WalletsService = WalletsService_1 = class WalletsService {
    walletsRepo;
    walletTransactionsRepo;
    configService;
    withdrawalRequestsRepo;
    usersRepo;
    mailService;
    eventEmitter;
    logger = new common_1.Logger(WalletsService_1.name);
    constructor(walletsRepo, walletTransactionsRepo, configService, withdrawalRequestsRepo, usersRepo, mailService, eventEmitter) {
        this.walletsRepo = walletsRepo;
        this.walletTransactionsRepo = walletTransactionsRepo;
        this.configService = configService;
        this.withdrawalRequestsRepo = withdrawalRequestsRepo;
        this.usersRepo = usersRepo;
        this.mailService = mailService;
        this.eventEmitter = eventEmitter;
    }
    async getMyWallet(userId) {
        const wallet = await this.walletsRepo.getOrCreateWallet(userId);
        return { balance: wallet.balance, status: wallet.status };
    }
    async getMyTransactions(payload) {
        const wallet = await this.walletsRepo.getOrCreateWallet(payload.userId);
        return this.walletTransactionsRepo.getMyTransactions(wallet._id, payload.page, payload.limit);
    }
    async mockDeposit(payload) {
        if (payload.amount <= 0)
            throw new common_1.BadRequestException('Số tiền nạp phải lớn hơn 0.');
        return this.walletsRepo.executeInTransaction(async () => {
            const wallet = await this.walletsRepo.getOrCreateWallet(payload.userId);
            const updatedWallet = await this.walletsRepo.atomicAdd(wallet._id, payload.amount);
            if (!updatedWallet)
                throw new common_1.InternalServerErrorException('Lỗi hệ thống khi nạp tiền.');
            await this.walletTransactionsRepo.createDocument({
                walletId: updatedWallet._id,
                type: wallet_transaction_schema_1.TransactionType.DEPOSIT,
                amount: payload.amount,
                postBalance: updatedWallet.balance,
                description: 'Nạp tiền giả định (Mock Deposit)',
            });
            this.eventEmitter.emit(wallet_event_constant_1.WalletEventPattern.DEPOSIT_SUCCESS, {
                userId: payload.userId,
                amount: payload.amount,
                newBalance: updatedWallet.balance,
            });
            return { message: 'Nạp tiền thành công', balance: updatedWallet.balance };
        });
    }
    async processPayment(payload) {
        const wallet = await this.walletsRepo.getOrCreateWallet(payload.userId);
        const updatedWallet = await this.walletsRepo.atomicDeduct(wallet._id, payload.amount);
        if (!updatedWallet) {
            throw new common_1.BadRequestException('Số dư ví không đủ để thực hiện giao dịch. Vui lòng nạp thêm Coin.');
        }
        await this.walletTransactionsRepo.createDocument({
            walletId: updatedWallet._id,
            type: wallet_transaction_schema_1.TransactionType.PAYMENT,
            amount: payload.amount,
            postBalance: updatedWallet.balance,
            referenceId: new mongoose_1.Types.ObjectId(payload.referenceId),
            referenceType: payload.referenceType,
            description: payload.description,
        });
        return updatedWallet;
    }
    async processSplitPayment(payload) {
        const buyerWallet = await this.walletsRepo.getOrCreateWallet(payload.buyerId);
        const updatedBuyerWallet = await this.walletsRepo.atomicDeduct(buyerWallet._id, payload.amount);
        if (!updatedBuyerWallet) {
            throw new common_1.BadRequestException('Số dư ví không đủ để thanh toán khóa học. Vui lòng nạp thêm Coin.');
        }
        await this.walletTransactionsRepo.createDocument({
            walletId: updatedBuyerWallet._id,
            type: wallet_transaction_schema_1.TransactionType.PAYMENT,
            amount: payload.amount,
            postBalance: updatedBuyerWallet.balance,
            referenceId: new mongoose_1.Types.ObjectId(payload.referenceId.toString()),
            referenceType: payload.referenceType,
            description: payload.description,
        });
        const platformFeePercent = this.configService.get('PLATFORM_FEE_PERCENT', 20);
        const feeAmount = Math.floor((payload.amount * platformFeePercent) / 100);
        const revenueAmount = payload.amount - feeAmount;
        if (revenueAmount > 0) {
            const sellerWallet = await this.walletsRepo.getOrCreateWallet(payload.sellerId);
            const updatedSellerWallet = await this.walletsRepo.atomicAdd(sellerWallet._id, revenueAmount);
            if (!updatedSellerWallet) {
                this.logger.error(`[CRITICAL] Lỗi cộng doanh thu ${revenueAmount} cho Giáo viên ${payload.sellerId}`);
                throw new common_1.InternalServerErrorException('Lỗi hệ thống: Không thể xử lý chia sẻ doanh thu.');
            }
            await this.walletTransactionsRepo.createDocument({
                walletId: updatedSellerWallet._id,
                type: wallet_transaction_schema_1.TransactionType.REVENUE,
                amount: revenueAmount,
                postBalance: updatedSellerWallet.balance,
                referenceId: new mongoose_1.Types.ObjectId(payload.referenceId.toString()),
                referenceType: payload.referenceType,
                description: `Doanh thu bán khóa học (Đã trừ ${platformFeePercent}% phí nền tảng)`,
            });
        }
        return {
            updatedBuyerWallet,
            revenueAmount: revenueAmount > 0 ? revenueAmount : 0,
        };
    }
    async processSubscriptionPayment(payload) {
        const wallet = await this.walletsRepo.getOrCreateWallet(payload.teacherId);
        const updatedWallet = await this.walletsRepo.atomicDeduct(wallet._id, payload.amount);
        if (!updatedWallet) {
            throw new common_1.BadRequestException('Số dư ví không đủ để nâng cấp gói cước. Vui lòng nạp thêm Coin.');
        }
        await this.walletTransactionsRepo.createDocument({
            walletId: updatedWallet._id,
            type: wallet_transaction_schema_1.TransactionType.PAYMENT,
            amount: payload.amount,
            postBalance: updatedWallet.balance,
            referenceId: new mongoose_1.Types.ObjectId(payload.planId.toString()),
            referenceType: wallet_transaction_schema_1.ReferenceType.ORDER,
            description: payload.description,
        });
        return true;
    }
    async requestWithdrawal(payload) {
        if (payload.amount < 100000) {
            throw new common_1.BadRequestException('Số tiền rút tối thiểu là 100,000 VNĐ.');
        }
        return this.walletsRepo.executeInTransaction(async () => {
            const wallet = await this.walletsRepo.getOrCreateWallet(payload.teacherId);
            const updatedWallet = await this.walletsRepo.atomicDeduct(wallet._id, payload.amount);
            if (!updatedWallet) {
                throw new common_1.BadRequestException('Số dư ví không đủ để rút số tiền này.');
            }
            const transaction = await this.walletTransactionsRepo.createDocument({
                walletId: updatedWallet._id,
                type: wallet_transaction_schema_1.TransactionType.WITHDRAWAL,
                amount: payload.amount,
                postBalance: updatedWallet.balance,
                description: `Khóa tiền: Yêu cầu rút ${payload.amount.toLocaleString('vi-VN')} VNĐ về ${payload.bankName}`,
            });
            const request = await this.withdrawalRequestsRepo.createDocument({
                teacherId: new mongoose_1.Types.ObjectId(payload.teacherId),
                amount: payload.amount,
                bankInfo: {
                    bankName: payload.bankName,
                    accountNumber: payload.accountNumber,
                    accountName: payload.accountName,
                },
                status: withdrawal_request_schema_1.WithdrawalStatus.PENDING,
                transactionId: transaction._id,
            });
            this.eventEmitter.emit(wallet_event_constant_1.WalletEventPattern.WITHDRAWAL_REQUESTED, {
                teacherId: payload.teacherId,
                amount: payload.amount,
                requestId: request._id.toString(),
            });
            return {
                message: 'Đã gửi yêu cầu rút tiền thành công. Vui lòng chờ Admin đối soát.',
                requestId: request._id.toString(),
            };
        });
    }
    async getWithdrawalRequestsForAdmin(payload) {
        return this.withdrawalRequestsRepo.getAdminWithdrawalRequests(payload.status, payload.page, payload.limit);
    }
    async processWithdrawalRequest(payload) {
        const transactionResult = await this.withdrawalRequestsRepo.executeInTransaction(async () => {
            const request = await this.withdrawalRequestsRepo.findByIdSafe(payload.requestId);
            if (!request)
                throw new common_1.NotFoundException('Yêu cầu rút tiền không tồn tại.');
            if (request.status !== withdrawal_request_schema_1.WithdrawalStatus.PENDING) {
                throw new common_1.BadRequestException(`Yêu cầu này đã được xử lý (Trạng thái hiện tại: ${request.status}).`);
            }
            const teacher = await this.usersRepo.findByIdSafe(request.teacherId, {
                select: 'email fullName',
            });
            if (!teacher)
                throw new common_1.InternalServerErrorException('Không tìm thấy thông tin chủ tài khoản.');
            const amountFormatted = `${request.amount.toLocaleString('vi-VN')} VNĐ`;
            if (payload.action === 'APPROVE') {
                await this.withdrawalRequestsRepo.updateByIdSafe(payload.requestId, {
                    $set: {
                        status: withdrawal_request_schema_1.WithdrawalStatus.COMPLETED,
                        processedBy: new mongoose_1.Types.ObjectId(payload.adminId),
                        processedAt: new Date(),
                    },
                });
                if (request.transactionId) {
                    await this.walletTransactionsRepo.updateByIdSafe(request.transactionId, {
                        $set: {
                            description: `Hoàn tất rút tiền ${amountFormatted} thành công.`,
                        },
                    });
                }
                const accNum = request.bankInfo?.accountNumber || '';
                const maskedAccount = accNum.length >= 4 ? accNum.slice(-4) : accNum;
                return {
                    action: 'APPROVE',
                    message: 'Đã ghi nhận đối soát rút tiền thành công.',
                    teacherId: request.teacherId.toString(),
                    amount: request.amount,
                    mailPayload: {
                        to: teacher.email,
                        fullName: teacher.fullName,
                        amountFormatted,
                        transactionId: request.transactionId?.toString() || payload.requestId,
                        bankInfoMasked: `${request.bankInfo?.bankName || 'Ngân hàng'} - **** ${maskedAccount}`,
                    },
                };
            }
            else {
                if (!payload.rejectionReason)
                    throw new common_1.BadRequestException('Bắt buộc phải nhập lý do từ chối.');
                const teacherWallet = await this.walletsRepo.getOrCreateWallet(request.teacherId);
                const updatedWallet = await this.walletsRepo.atomicAdd(teacherWallet._id, request.amount);
                if (!updatedWallet)
                    throw new common_1.InternalServerErrorException('Lỗi hệ thống: Không thể hoàn tiền vào ví.');
                await this.walletTransactionsRepo.createDocument({
                    walletId: updatedWallet._id,
                    type: wallet_transaction_schema_1.TransactionType.REFUND,
                    amount: request.amount,
                    postBalance: updatedWallet.balance,
                    description: `Hoàn tiền rút thất bại. Lý do: ${payload.rejectionReason}`,
                });
                await this.withdrawalRequestsRepo.updateByIdSafe(payload.requestId, {
                    $set: {
                        status: withdrawal_request_schema_1.WithdrawalStatus.REJECTED,
                        processedBy: new mongoose_1.Types.ObjectId(payload.adminId),
                        processedAt: new Date(),
                        rejectionReason: payload.rejectionReason,
                    },
                });
                return {
                    action: 'REJECT',
                    message: 'Đã từ chối yêu cầu và hoàn trả tiền vào ví giáo viên.',
                    teacherId: request.teacherId.toString(),
                    amount: request.amount,
                    mailPayload: {
                        to: teacher.email,
                        fullName: teacher.fullName,
                        amountFormatted,
                        transactionId: request.transactionId?.toString() || payload.requestId,
                        rejectionReason: payload.rejectionReason,
                    },
                };
            }
        });
        try {
            if (transactionResult.action === 'APPROVE') {
                await this.mailService.addWithdrawalApprovalJob(transactionResult.mailPayload);
                this.eventEmitter.emit(wallet_event_constant_1.WalletEventPattern.WITHDRAWAL_APPROVED, {
                    teacherId: transactionResult.teacherId,
                    amount: transactionResult.amount,
                    requestId: payload.requestId,
                });
            }
            else {
                await this.mailService.addWithdrawalRejectionJob(transactionResult.mailPayload);
                this.eventEmitter.emit(wallet_event_constant_1.WalletEventPattern.WITHDRAWAL_REJECTED, {
                    teacherId: transactionResult.teacherId,
                    amount: transactionResult.amount,
                    requestId: payload.requestId,
                    reason: payload.rejectionReason,
                });
            }
        }
        catch (error) {
            this.logger.error(`[Mail/Event Alert] Lỗi hậu xử lý withdrawal: ${error.message}`);
        }
        return { message: transactionResult.message };
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = WalletsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [wallets_repository_1.WalletsRepository,
        wallet_transactions_repository_1.WalletTransactionsRepository,
        config_1.ConfigService,
        withdrawal_requests_repository_1.WithdrawalRequestsRepository,
        users_repository_1.UsersRepository,
        mail_service_1.MailService,
        event_emitter_1.EventEmitter2])
], WalletsService);
//# sourceMappingURL=wallets.service.js.map