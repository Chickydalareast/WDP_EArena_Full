import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WalletsRepository } from './wallets.repository';
import { WalletTransactionsRepository } from './wallet-transactions.repository';
import { MockDepositPayload, ProcessPaymentPayload, GetTransactionsPayload, ProcessSplitPaymentPayload, ProcessSubscriptionPaymentPayload } from './interfaces/wallet.interface';
import { WithdrawalRequestsRepository } from './withdrawal-requests.repository';
import { CreateWithdrawalPayload, GetWithdrawalRequestsPayload, ProcessWithdrawalPayload } from './interfaces/withdrawal.interface';
import { UsersRepository } from '../users/users.repository';
import { MailService } from '../mail/mail.service';
export declare class WalletsService {
    private readonly walletsRepo;
    private readonly walletTransactionsRepo;
    private readonly configService;
    private readonly withdrawalRequestsRepo;
    private readonly usersRepo;
    private readonly mailService;
    private readonly eventEmitter;
    private readonly logger;
    constructor(walletsRepo: WalletsRepository, walletTransactionsRepo: WalletTransactionsRepository, configService: ConfigService, withdrawalRequestsRepo: WithdrawalRequestsRepository, usersRepo: UsersRepository, mailService: MailService, eventEmitter: EventEmitter2);
    getMyWallet(userId: string): Promise<{
        balance: number;
        status: import("./schemas/wallet.schema").WalletStatus;
    }>;
    getMyTransactions(payload: GetTransactionsPayload): Promise<{
        data: (import("./schemas/wallet-transaction.schema").WalletTransaction & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    mockDeposit(payload: MockDepositPayload): Promise<{
        message: string;
        balance: number;
    }>;
    processPayment(payload: ProcessPaymentPayload): Promise<import("./schemas/wallet.schema").WalletDocument>;
    processSplitPayment(payload: ProcessSplitPaymentPayload): Promise<{
        updatedBuyerWallet: import("./schemas/wallet.schema").WalletDocument;
        revenueAmount: number;
    }>;
    processSubscriptionPayment(payload: ProcessSubscriptionPaymentPayload): Promise<boolean>;
    requestWithdrawal(payload: CreateWithdrawalPayload): Promise<{
        message: string;
        requestId: string;
    }>;
    getWithdrawalRequestsForAdmin(payload: GetWithdrawalRequestsPayload): Promise<{
        items: (import("./schemas/withdrawal-request.schema").WithdrawalRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    processWithdrawalRequest(payload: ProcessWithdrawalPayload): Promise<{
        message: string;
    }>;
}
