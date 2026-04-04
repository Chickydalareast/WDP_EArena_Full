export interface CreateWithdrawalPayload {
    teacherId: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
}
export interface ProcessWithdrawalPayload {
    requestId: string;
    adminId: string;
    action: 'APPROVE' | 'REJECT';
    rejectionReason?: string;
}
export interface GetWithdrawalRequestsPayload {
    status?: string;
    page: number;
    limit: number;
}
