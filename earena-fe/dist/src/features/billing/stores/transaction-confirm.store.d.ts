export type TransactionActionType = 'DEPOSIT' | 'WITHDRAW' | 'PAYMENT';
export interface TransactionPayload {
    title: string;
    description?: string;
    actionType: TransactionActionType;
    amount: number;
    currentBalance: number;
    onConfirm: () => Promise<void>;
}
export declare const useTransactionConfirmStore: any;
