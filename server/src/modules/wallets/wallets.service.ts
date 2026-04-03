import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WalletsRepository } from './wallets.repository';
import { WalletTransactionsRepository } from './wallet-transactions.repository';
import {
  TransactionType,
  ReferenceType,
} from './schemas/wallet-transaction.schema';
import {
  MockDepositPayload,
  ProcessPaymentPayload,
  GetTransactionsPayload,
  ProcessSplitPaymentPayload,
  ProcessSubscriptionPaymentPayload,
} from './interfaces/wallet.interface';
import { WithdrawalRequestsRepository } from './withdrawal-requests.repository';
import {
  CreateWithdrawalPayload,
  GetWithdrawalRequestsPayload,
  ProcessWithdrawalPayload,
} from './interfaces/withdrawal.interface';
import { WithdrawalStatus } from './schemas/withdrawal-request.schema';
import { UsersRepository } from '../users/users.repository';
import { MailService } from '../mail/mail.service';
import {
  WalletEventPattern,
  DepositSuccessEventPayload,
  WithdrawalRequestedEventPayload,
  WithdrawalApprovedEventPayload,
  WithdrawalRejectedEventPayload,
} from './constants/wallet-event.constant';

@Injectable()
export class WalletsService {
  private readonly logger = new Logger(WalletsService.name);

  constructor(
    private readonly walletsRepo: WalletsRepository,
    private readonly walletTransactionsRepo: WalletTransactionsRepository,
    private readonly configService: ConfigService,
    private readonly withdrawalRequestsRepo: WithdrawalRequestsRepository,
    private readonly usersRepo: UsersRepository,
    private readonly mailService: MailService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getMyWallet(userId: string) {
    const wallet = await this.walletsRepo.getOrCreateWallet(userId);
    return { balance: wallet.balance, status: wallet.status };
  }

  async getMyTransactions(payload: GetTransactionsPayload) {
    const wallet = await this.walletsRepo.getOrCreateWallet(payload.userId);
    return this.walletTransactionsRepo.getMyTransactions(
      wallet._id,
      payload.page,
      payload.limit,
    );
  }

  async mockDeposit(payload: MockDepositPayload) {
    if (payload.amount <= 0)
      throw new BadRequestException('Số tiền nạp phải lớn hơn 0.');

    return this.walletsRepo.executeInTransaction(async () => {
      const wallet = await this.walletsRepo.getOrCreateWallet(payload.userId);
      const updatedWallet = await this.walletsRepo.atomicAdd(
        wallet._id,
        payload.amount,
      );

      if (!updatedWallet)
        throw new InternalServerErrorException('Lỗi hệ thống khi nạp tiền.');

      await this.walletTransactionsRepo.createDocument({
        walletId: updatedWallet._id,
        type: TransactionType.DEPOSIT,
        amount: payload.amount,
        postBalance: updatedWallet.balance,
        description: 'Nạp tiền giả định (Mock Deposit)',
      });

      this.eventEmitter.emit(WalletEventPattern.DEPOSIT_SUCCESS, {
        userId: payload.userId,
        amount: payload.amount,
        newBalance: updatedWallet.balance,
      } as DepositSuccessEventPayload);

      return { message: 'Nạp tiền thành công', balance: updatedWallet.balance };
    });
  }

  async processPayment(payload: ProcessPaymentPayload) {
    const wallet = await this.walletsRepo.getOrCreateWallet(payload.userId);

    const updatedWallet = await this.walletsRepo.atomicDeduct(
      wallet._id,
      payload.amount,
    );

    if (!updatedWallet) {
      throw new BadRequestException(
        'Số dư ví không đủ để thực hiện giao dịch. Vui lòng nạp thêm Coin.',
      );
    }

    await this.walletTransactionsRepo.createDocument({
      walletId: updatedWallet._id,
      type: TransactionType.PAYMENT,
      amount: payload.amount,
      postBalance: updatedWallet.balance,
      referenceId: new Types.ObjectId(payload.referenceId),
      referenceType: payload.referenceType,
      description: payload.description,
    });

    return updatedWallet;
  }

  async processSplitPayment(payload: ProcessSplitPaymentPayload) {
    const buyerWallet = await this.walletsRepo.getOrCreateWallet(
      payload.buyerId,
    );
    const updatedBuyerWallet = await this.walletsRepo.atomicDeduct(
      buyerWallet._id,
      payload.amount,
    );

    if (!updatedBuyerWallet) {
      throw new BadRequestException(
        'Số dư ví không đủ để thanh toán khóa học. Vui lòng nạp thêm Coin.',
      );
    }

    await this.walletTransactionsRepo.createDocument({
      walletId: updatedBuyerWallet._id,
      type: TransactionType.PAYMENT,
      amount: payload.amount,
      postBalance: updatedBuyerWallet.balance,
      referenceId: new Types.ObjectId(payload.referenceId.toString()),
      referenceType: payload.referenceType,
      description: payload.description,
    });

    const platformFeePercent = this.configService.get<number>(
      'PLATFORM_FEE_PERCENT',
      20,
    );
    const feeAmount = Math.floor((payload.amount * platformFeePercent) / 100);
    const revenueAmount = payload.amount - feeAmount;

    if (revenueAmount > 0) {
      const sellerWallet = await this.walletsRepo.getOrCreateWallet(
        payload.sellerId,
      );
      const updatedSellerWallet = await this.walletsRepo.atomicAdd(
        sellerWallet._id,
        revenueAmount,
      );

      if (!updatedSellerWallet) {
        this.logger.error(
          `[CRITICAL] Lỗi cộng doanh thu ${revenueAmount} cho Giáo viên ${payload.sellerId}`,
        );
        throw new InternalServerErrorException(
          'Lỗi hệ thống: Không thể xử lý chia sẻ doanh thu.',
        );
      }

      await this.walletTransactionsRepo.createDocument({
        walletId: updatedSellerWallet._id,
        type: TransactionType.REVENUE,
        amount: revenueAmount,
        postBalance: updatedSellerWallet.balance,
        referenceId: new Types.ObjectId(payload.referenceId.toString()),
        referenceType: payload.referenceType,
        description: `Doanh thu bán khóa học (Đã trừ ${platformFeePercent}% phí nền tảng)`,
      });
    }

    return {
      updatedBuyerWallet,
      revenueAmount: revenueAmount > 0 ? revenueAmount : 0,
    };
  }

  async processSubscriptionPayment(payload: ProcessSubscriptionPaymentPayload) {
    const wallet = await this.walletsRepo.getOrCreateWallet(payload.teacherId);
    const updatedWallet = await this.walletsRepo.atomicDeduct(
      wallet._id,
      payload.amount,
    );

    if (!updatedWallet) {
      throw new BadRequestException(
        'Số dư ví không đủ để nâng cấp gói cước. Vui lòng nạp thêm Coin.',
      );
    }

    await this.walletTransactionsRepo.createDocument({
      walletId: updatedWallet._id,
      type: TransactionType.PAYMENT,
      amount: payload.amount,
      postBalance: updatedWallet.balance,
      referenceId: new Types.ObjectId(payload.planId.toString()),
      referenceType: ReferenceType.ORDER,
      description: payload.description,
    });

    return true;
  }

  async requestWithdrawal(payload: CreateWithdrawalPayload) {
    if (payload.amount < 100000) {
      throw new BadRequestException('Số tiền rút tối thiểu là 100,000 VNĐ.');
    }

    return this.walletsRepo.executeInTransaction(async () => {
      const wallet = await this.walletsRepo.getOrCreateWallet(
        payload.teacherId,
      );
      const updatedWallet = await this.walletsRepo.atomicDeduct(
        wallet._id,
        payload.amount,
      );

      if (!updatedWallet) {
        throw new BadRequestException('Số dư ví không đủ để rút số tiền này.');
      }

      const transaction = await this.walletTransactionsRepo.createDocument({
        walletId: updatedWallet._id,
        type: TransactionType.WITHDRAWAL,
        amount: payload.amount,
        postBalance: updatedWallet.balance,
        description: `Khóa tiền: Yêu cầu rút ${payload.amount.toLocaleString('vi-VN')} VNĐ về ${payload.bankName}`,
      });

      const request = await this.withdrawalRequestsRepo.createDocument({
        teacherId: new Types.ObjectId(payload.teacherId),
        amount: payload.amount,
        bankInfo: {
          bankName: payload.bankName,
          accountNumber: payload.accountNumber,
          accountName: payload.accountName,
        },
        status: WithdrawalStatus.PENDING,
        transactionId: transaction._id,
      });

      this.eventEmitter.emit(WalletEventPattern.WITHDRAWAL_REQUESTED, {
        teacherId: payload.teacherId,
        amount: payload.amount,
        requestId: request._id.toString(),
      } as WithdrawalRequestedEventPayload);

      return {
        message:
          'Đã gửi yêu cầu rút tiền thành công. Vui lòng chờ Admin đối soát.',
        requestId: request._id.toString(),
      };
    });
  }

  async getWithdrawalRequestsForAdmin(payload: GetWithdrawalRequestsPayload) {
    return this.withdrawalRequestsRepo.getAdminWithdrawalRequests(
      payload.status,
      payload.page,
      payload.limit,
    );
  }

  async processWithdrawalRequest(payload: ProcessWithdrawalPayload) {
    const transactionResult =
      await this.withdrawalRequestsRepo.executeInTransaction(async () => {
        const request = await this.withdrawalRequestsRepo.findByIdSafe(
          payload.requestId,
        );
        if (!request)
          throw new NotFoundException('Yêu cầu rút tiền không tồn tại.');

        if (request.status !== WithdrawalStatus.PENDING) {
          throw new BadRequestException(
            `Yêu cầu này đã được xử lý (Trạng thái hiện tại: ${request.status}).`,
          );
        }

        const teacher = await this.usersRepo.findByIdSafe(request.teacherId, {
          select: 'email fullName',
        });
        if (!teacher)
          throw new InternalServerErrorException(
            'Không tìm thấy thông tin chủ tài khoản.',
          );

        const amountFormatted = `${request.amount.toLocaleString('vi-VN')} VNĐ`;

        if (payload.action === 'APPROVE') {
          await this.withdrawalRequestsRepo.updateByIdSafe(payload.requestId, {
            $set: {
              status: WithdrawalStatus.COMPLETED,
              processedBy: new Types.ObjectId(payload.adminId),
              processedAt: new Date(),
            },
          });

          if (request.transactionId) {
            await this.walletTransactionsRepo.updateByIdSafe(
              request.transactionId,
              {
                $set: {
                  description: `Hoàn tất rút tiền ${amountFormatted} thành công.`,
                },
              },
            );
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
              transactionId:
                request.transactionId?.toString() || payload.requestId,
              bankInfoMasked: `${request.bankInfo?.bankName || 'Ngân hàng'} - **** ${maskedAccount}`,
            },
          };
        } else {
          if (!payload.rejectionReason)
            throw new BadRequestException('Bắt buộc phải nhập lý do từ chối.');

          const teacherWallet = await this.walletsRepo.getOrCreateWallet(
            request.teacherId,
          );

          const updatedWallet = await this.walletsRepo.atomicAdd(
            teacherWallet._id,
            request.amount,
          );
          if (!updatedWallet)
            throw new InternalServerErrorException(
              'Lỗi hệ thống: Không thể hoàn tiền vào ví.',
            );

          await this.walletTransactionsRepo.createDocument({
            walletId: updatedWallet._id,
            type: TransactionType.REFUND,
            amount: request.amount,
            postBalance: updatedWallet.balance,
            description: `Hoàn tiền rút thất bại. Lý do: ${payload.rejectionReason}`,
          });

          await this.withdrawalRequestsRepo.updateByIdSafe(payload.requestId, {
            $set: {
              status: WithdrawalStatus.REJECTED,
              processedBy: new Types.ObjectId(payload.adminId),
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
              transactionId:
                request.transactionId?.toString() || payload.requestId,
              rejectionReason: payload.rejectionReason,
            },
          };
        }
      });

    try {
      if (transactionResult.action === 'APPROVE') {
        await this.mailService.addWithdrawalApprovalJob(
          transactionResult.mailPayload as any,
        );

        this.eventEmitter.emit(WalletEventPattern.WITHDRAWAL_APPROVED, {
          teacherId: transactionResult.teacherId,
          amount: transactionResult.amount,
          requestId: payload.requestId,
        } as WithdrawalApprovedEventPayload);
      } else {
        await this.mailService.addWithdrawalRejectionJob(
          transactionResult.mailPayload as any,
        );

        this.eventEmitter.emit(WalletEventPattern.WITHDRAWAL_REJECTED, {
          teacherId: transactionResult.teacherId,
          amount: transactionResult.amount,
          requestId: payload.requestId,
          reason: payload.rejectionReason,
        } as WithdrawalRejectedEventPayload);
      }
    } catch (error: any) {
      this.logger.error(
        `[Mail/Event Alert] Lỗi hậu xử lý withdrawal: ${error.message}`,
      );
    }

    return { message: transactionResult.message };
  }
}
