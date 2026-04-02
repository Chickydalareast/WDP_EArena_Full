import { create } from 'zustand';

interface MatrixErrorState {
    isOpen: boolean;
    errorMessage: string;
    showError: (message: string) => void;
    closeError: () => void;
}

export const useMatrixErrorStore = create<MatrixErrorState>((set) => ({
    isOpen: false,
    errorMessage: '',
    showError: (message) => set({ isOpen: true, errorMessage: message }),
    closeError: () => set({ isOpen: false, errorMessage: '' }),
}));