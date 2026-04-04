import { z } from 'zod';
export declare const depositSchema: any;
export type DepositFormDTO = z.infer<typeof depositSchema>;
export interface MockDepositResponse {
    message: string;
    balance: number;
}
export type TransactionType = 'DEPOSIT' | 'PAYMENT' | 'REVENUE' | 'REFUND' | 'WITHDRAWAL';
export interface WalletTransaction {
    _id: string;
    walletId: string;
    type: TransactionType;
    amount: number;
    postBalance: number;
    description: string;
    createdAt: string;
}
export declare const withdrawSchema: any;
export type WithdrawFormDTO = z.infer<typeof withdrawSchema>;
export interface GetTransactionsParams {
    page?: number;
    limit?: number;
}
export interface PaginatedTransactions {
    data: WalletTransaction[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
