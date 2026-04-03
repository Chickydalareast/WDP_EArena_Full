import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications.service';
import { NotificationType } from '../constants/notification-event.constant';
import { WalletEventPattern } from '../../wallets/constants/wallet-event.constant';

import type {
  DepositSuccessEventPayload,
  WithdrawalRequestedEventPayload,
  WithdrawalApprovedEventPayload,
  WithdrawalRejectedEventPayload,
} from '../../wallets/constants/wallet-event.constant';
import { UsersRepository } from '../../users/users.repository';
import { UserRole } from '../../../common/enums/user-role.enum';

@Injectable()
export class WalletNotificationListener {
  private readonly logger = new Logger(WalletNotificationListener.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly usersRepo: UsersRepository,
  ) {}

  @OnEvent(WalletEventPattern.DEPOSIT_SUCCESS, { async: true })
  async handleDepositSuccess(payload: DepositSuccessEventPayload) {
    try {
      const amountFormatted = payload.amount.toLocaleString('vi-VN');
      const balanceFormatted = payload.newBalance.toLocaleString('vi-VN');

      await this.notificationsService.createAndDispatch({
        receiverId: payload.userId,
        type: NotificationType.FINANCE,
        title: 'Nạp tiền thành công! 💳',
        message: `Ví của bạn vừa được cộng ${amountFormatted} Coin. Số dư hiện tại: ${balanceFormatted} Coin.`,
        payload: { url: '/student/wallet' },
      });
    } catch (error: any) {
      this.logger.error(
        `[Listener Error] DEPOSIT_SUCCESS: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent(WalletEventPattern.WITHDRAWAL_REQUESTED, { async: true })
  async handleWithdrawalRequested(payload: WithdrawalRequestedEventPayload) {
    try {
      const teacher = await this.usersRepo.findByIdSafe(payload.teacherId, {
        select: 'fullName',
      });
      const teacherName = teacher ? teacher.fullName : 'Một giáo viên';
      const amountFormatted = payload.amount.toLocaleString('vi-VN');

      await this.notificationsService.createAndDispatch({
        receiverId: payload.teacherId,
        type: NotificationType.FINANCE,
        title: 'Đã tạo lệnh rút tiền ⏳',
        message: `Yêu cầu rút ${amountFormatted} VNĐ của bạn đang được hệ thống xử lý.`,
        payload: { requestId: payload.requestId, url: '/teacher/wallet' },
      });

      // Tìm Admin
      const admins = await this.usersRepo.modelInstance
        .find({ role: UserRole.ADMIN })
        .select('_id')
        .lean()
        .exec();
      if (!admins.length) return;

      // Bắn cho Ban quản trị
      await Promise.all(
        admins.map((admin) =>
          this.notificationsService.createAndDispatch({
            receiverId: admin._id.toString(),
            type: NotificationType.FINANCE,
            title: 'Yêu cầu rút tiền mới! ⚠️',
            message: `Giáo viên ${teacherName} vừa đặt lệnh rút ${amountFormatted} VNĐ. Vui lòng đối soát.`,
            payload: {
              requestId: payload.requestId,
              url: '/admin/withdrawals',
            },
          }),
        ),
      );
    } catch (error: any) {
      this.logger.error(
        `[Listener Error] WITHDRAWAL_REQUESTED: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent(WalletEventPattern.WITHDRAWAL_APPROVED, { async: true })
  async handleWithdrawalApproved(payload: WithdrawalApprovedEventPayload) {
    try {
      const amountFormatted = payload.amount.toLocaleString('vi-VN');

      await this.notificationsService.createAndDispatch({
        receiverId: payload.teacherId,
        type: NotificationType.FINANCE,
        title: 'Rút tiền thành công! 💸',
        message: `Yêu cầu rút ${amountFormatted} VNĐ của bạn đã được duyệt và chuyển khoản thành công.`,
        payload: { requestId: payload.requestId, url: '/teacher/wallet' },
      });
    } catch (error: any) {
      this.logger.error(
        `[Listener Error] WITHDRAWAL_APPROVED: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent(WalletEventPattern.WITHDRAWAL_REJECTED, { async: true })
  async handleWithdrawalRejected(payload: WithdrawalRejectedEventPayload) {
    try {
      const amountFormatted = payload.amount.toLocaleString('vi-VN');

      await this.notificationsService.createAndDispatch({
        receiverId: payload.teacherId,
        type: NotificationType.SYSTEM,
        title: 'Rút tiền thất bại ❌',
        message: `Yêu cầu rút ${amountFormatted} VNĐ của bạn bị từ chối. Lý do: ${payload.reason}. Số tiền đã được hoàn lại vào ví.`,
        payload: { requestId: payload.requestId, url: '/teacher/wallet' },
      });
    } catch (error: any) {
      this.logger.error(
        `[Listener Error] WITHDRAWAL_REJECTED: ${error.message}`,
        error.stack,
      );
    }
  }
}
