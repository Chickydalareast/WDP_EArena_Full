import { create } from 'zustand';

export type TransactionActionType = 'DEPOSIT' | 'WITHDRAW' | 'PAYMENT';

export interface TransactionPayload {
    title: string;
    description?: string;
    actionType: TransactionActionType;
    amount: number;
    currentBalance: number;
    onConfirm: () => Promise<void>;
}

interface TransactionConfirmState {
    isOpen: boolean;
    payload: TransactionPayload | null;
    openConfirm: (payload: TransactionPayload) => void;
    closeConfirm: () => void;
}

export const useTransactionConfirmStore = create<TransactionConfirmState>((set) => ({
    isOpen: false,
    payload: null,
    openConfirm: (payload) => set({ isOpen: true, payload }),
    closeConfirm: () => set({ isOpen: false, payload: null }),
}));