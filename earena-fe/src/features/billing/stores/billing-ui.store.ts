import { create } from 'zustand';

interface BillingUIState {
  isDepositModalOpen: boolean;
  requiredAmount: number;
  openDepositModal: (requiredAmount?: number) => void;
  closeDepositModal: () => void;
}

export const useBillingUIStore = create<BillingUIState>((set) => ({
  isDepositModalOpen: false,
  requiredAmount: 0,
  openDepositModal: (amount = 0) => set({ isDepositModalOpen: true, requiredAmount: amount }),
  closeDepositModal: () => set({ isDepositModalOpen: false, requiredAmount: 0 }),
}));