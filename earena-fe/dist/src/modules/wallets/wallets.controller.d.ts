import { WalletsService } from './wallets.service';
import { MockDepositDto, GetTransactionsDto } from './dto/wallets.dto';
import { CreateWithdrawalDto } from './dto/withdraw.dto';
export declare class WalletsController {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    getMyWallet(userId: string): Promise<{
        message: string;
        data: {
            balance: number;
            status: import("./schemas/wallet.schema").WalletStatus;
        };
    }>;
    getMyTransactions(query: GetTransactionsDto, userId: string): Promise<{
        message: string;
        data: (import("./schemas/wallet-transaction.schema").WalletTransaction & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
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
    mockDeposit(dto: MockDepositDto, userId: string): Promise<{
        message: string;
        balance: number;
    }>;
    requestWithdrawal(dto: CreateWithdrawalDto, userId: string): Promise<{
        message: string;
        requestId: string;
    }>;
}
