import { GetTransactionsParams, PaginatedTransactions, WithdrawFormDTO } from '../types/billing.schema';
export declare const billingService: {
    checkoutCourse: (courseId: string) => Promise<{
        message: string;
        enrollmentId: string;
    }>;
    getMyWallet: () => Promise<{
        balance: number;
        status: string;
    }>;
    getMyTransactions: (params: GetTransactionsParams) => Promise<PaginatedTransactions>;
    deposit: (amount: number) => Promise<{
        message: string;
        balance: number;
    }>;
    withdraw: (payload: WithdrawFormDTO) => Promise<{
        message: string;
        requestId: string;
    }>;
};
