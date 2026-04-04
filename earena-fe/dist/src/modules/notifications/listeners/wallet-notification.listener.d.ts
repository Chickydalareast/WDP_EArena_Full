import { NotificationsService } from '../notifications.service';
import type { DepositSuccessEventPayload, WithdrawalRequestedEventPayload, WithdrawalApprovedEventPayload, WithdrawalRejectedEventPayload } from '../../wallets/constants/wallet-event.constant';
import { UsersRepository } from '../../users/users.repository';
export declare class WalletNotificationListener {
    private readonly notificationsService;
    private readonly usersRepo;
    private readonly logger;
    constructor(notificationsService: NotificationsService, usersRepo: UsersRepository);
    handleDepositSuccess(payload: DepositSuccessEventPayload): Promise<void>;
    handleWithdrawalRequested(payload: WithdrawalRequestedEventPayload): Promise<void>;
    handleWithdrawalApproved(payload: WithdrawalApprovedEventPayload): Promise<void>;
    handleWithdrawalRejected(payload: WithdrawalRejectedEventPayload): Promise<void>;
}
