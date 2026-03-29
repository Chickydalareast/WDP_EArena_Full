import { create } from 'zustand';

interface UpgradeUIState {
    isOpen: boolean;
    message: string | null;
    openModal: (message?: string) => void;
    closeModal: () => void;
}

export const useUpgradeUIStore = create<UpgradeUIState>((set) => ({
    isOpen: false,
    message: null,
    openModal: (message) => set({ isOpen: true, message: message || 'Vui lòng nâng cấp gói cước để tiếp tục.' }),
    closeModal: () => set({ isOpen: false, message: null }),
}));