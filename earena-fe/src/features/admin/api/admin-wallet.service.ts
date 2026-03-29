import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { GetWithdrawalsParams, WithdrawalsResponse, ProcessWithdrawalDTO } from '../types/admin-wallet.schema';

export const adminWalletService = {
    getWithdrawals: async (params: GetWithdrawalsParams): Promise<WithdrawalsResponse> => {
        return axiosClient.get(API_ENDPOINTS.ADMIN_WALLETS.WITHDRAWALS, { params });
    },

    processWithdrawal: async (id: string, payload: ProcessWithdrawalDTO): Promise<{ message: string }> => {
        return axiosClient.patch(API_ENDPOINTS.ADMIN_WALLETS.PROCESS_WITHDRAWAL(id), payload);
    },
};