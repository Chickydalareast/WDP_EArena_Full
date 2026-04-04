import { axiosClient } from '@/shared/lib/axios-client';
import { GetTransactionsParams, PaginatedTransactions, WithdrawFormDTO } from '../types/billing.schema';
import { API_ENDPOINTS } from '@/config/api-endpoints';

export interface CreatePaymentLinkResponse {
  checkoutUrl: string;
  orderCode: string;
}

export const billingService = {
  checkoutCourse: async (courseId: string): Promise<{ message: string; enrollmentId: string }> => {
    return axiosClient.post(API_ENDPOINTS.ENROLLMENTS.ENROLL(courseId), {});
  },

  getMyWallet: async (): Promise<{ balance: number; status: string }> => {
    return axiosClient.get(API_ENDPOINTS.WALLETS.ME);
  },

  getMyTransactions: async (params: GetTransactionsParams): Promise<PaginatedTransactions> => {
    return axiosClient.get(API_ENDPOINTS.WALLETS.TRANSACTIONS, { params });
  },

  deposit: async (amount: number): Promise<{ message: string; balance: number }> => {
    return axiosClient.post(API_ENDPOINTS.WALLETS.MOCK_DEPOSIT, { amount });
  },

  createPaymentLink: async (
    amount: number,
    returnPath?: string,
  ): Promise<CreatePaymentLinkResponse> => {
    return axiosClient.post(API_ENDPOINTS.PAYMENT.CREATE_EMBEDDED_LINK, {
      amount,
      ...(returnPath ? { returnPath } : {}),
    });
  },

  confirmPayOsReturn: async (orderCode: number): Promise<{ balance: number }> => {
    return axiosClient.post(API_ENDPOINTS.PAYMENT.CONFIRM_RETURN, { orderCode });
  },

  withdraw: async (payload: WithdrawFormDTO): Promise<{ message: string; requestId: string }> => {
    return axiosClient.post(API_ENDPOINTS.WALLETS.WITHDRAW, payload);
  }
};