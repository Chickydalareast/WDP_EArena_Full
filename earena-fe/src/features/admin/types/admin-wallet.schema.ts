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
    bankInfo: BankInfo | null;
    status: WithdrawalStatus;
    /** Populate có thể null nếu tài khoản GV đã xóa */
    teacherId: TeacherInfo | null;
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

export const processWithdrawalSchema = z.discriminatedUnion('action', [
    z.object({
        action: z.literal('APPROVE'),
    }),
    z.object({
        action: z.literal('REJECT'),
        rejectionReason: z.string().trim().min(5, 'Vui lòng nhập lý do từ chối chi tiết (ít nhất 5 ký tự)'),
    }),
]);

export type ProcessWithdrawalDTO = z.infer<typeof processWithdrawalSchema>;