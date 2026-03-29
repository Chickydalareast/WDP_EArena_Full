import { create } from 'zustand';

interface ExamBuilderState {
  isQuestionBankModalOpen: boolean;
  setQuestionBankModalOpen: (isOpen: boolean) => void;
}

export const useExamBuilderStore = create<ExamBuilderState>((set) => ({
  isQuestionBankModalOpen: false,
  setQuestionBankModalOpen: (isOpen) => set({ isQuestionBankModalOpen: isOpen }),
}));