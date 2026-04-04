import { z } from 'zod';
export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
export interface TeacherInfo {
    _id: string;
    email: string;
    fullName: string;
    phone: string;
}
export interface BankInfo {
    bankName: string;
    accountNumber: string;
    accountName: string;
}
export interface WithdrawalRequest {
    _id: string;
    amount: number;
    bankInfo: BankInfo;
    status: WithdrawalStatus;
    teacherId: TeacherInfo;
    createdAt: string;
}
export interface WithdrawalsResponse {
    data: WithdrawalRequest[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface GetWithdrawalsParams {
    page?: number;
    limit?: number;
    status?: WithdrawalStatus | '';
}
export declare const processWithdrawalSchema: any;
export type ProcessWithdrawalDTO = z.infer<typeof processWithdrawalSchema>;
