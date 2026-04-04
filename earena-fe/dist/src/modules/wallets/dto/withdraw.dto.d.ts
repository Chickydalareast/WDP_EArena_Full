export declare class CreateWithdrawalDto {
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
}
export declare enum ProcessAction {
    APPROVE = "APPROVE",
    REJECT = "REJECT"
}
export declare class ProcessWithdrawalDto {
    action: ProcessAction;
    rejectionReason?: string;
}
