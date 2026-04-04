import { WalletsService } from '../../wallets/wallets.service';
import { ProcessWithdrawalDto } from '../../wallets/dto/withdraw.dto';
import { AdminGetWithdrawalsQueryDto } from '../dto/admin-wallets.dto';
export declare class AdminWalletsController {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    getWithdrawalRequests(query: AdminGetWithdrawalsQueryDto): Promise<{
        message: string;
        data: (import("../../wallets/schemas/withdrawal-request.schema").WithdrawalRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
    processWithdrawal(id: string, dto: ProcessWithdrawalDto, adminId: string): Promise<{
        message: string;
    }>;
}
