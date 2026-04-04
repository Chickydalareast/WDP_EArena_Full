export interface WithdrawalMailBasePayload {
    to: string;
    fullName: string;
    amountFormatted: string;
    transactionId: string;
}
export interface WithdrawalApprovalMailPayload extends WithdrawalMailBasePayload {
    bankInfoMasked: string;
}
export interface WithdrawalRejectionMailPayload extends WithdrawalMailBasePayload {
    rejectionReason: string;
}
