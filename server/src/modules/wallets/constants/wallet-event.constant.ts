export enum WalletEventPattern {
  DEPOSIT_SUCCESS = 'wallet.deposit_success',
  WITHDRAWAL_REQUESTED = 'wallet.withdrawal_requested',
  WITHDRAWAL_APPROVED = 'wallet.withdrawal_approved',
  WITHDRAWAL_REJECTED = 'wallet.withdrawal_rejected',
}

export interface DepositSuccessEventPayload {
  userId: string;
  amount: number;
  newBalance: number;
}

export interface WithdrawalRequestedEventPayload {
  teacherId: string;
  amount: number;
  requestId: string;
}

export interface WithdrawalApprovedEventPayload {
  teacherId: string;
  amount: number;
  requestId: string;
}

export interface WithdrawalRejectedEventPayload {
  teacherId: string;
  amount: number;
  requestId: string;
  reason: string;
}
