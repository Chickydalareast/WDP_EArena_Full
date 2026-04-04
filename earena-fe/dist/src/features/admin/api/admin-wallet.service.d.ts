import { GetWithdrawalsParams, WithdrawalsResponse, ProcessWithdrawalDTO } from '../types/admin-wallet.schema';
export declare const adminWalletService: {
    getWithdrawals: (params: GetWithdrawalsParams) => Promise<WithdrawalsResponse>;
    processWithdrawal: (id: string, payload: ProcessWithdrawalDTO) => Promise<{
        message: string;
    }>;
};
