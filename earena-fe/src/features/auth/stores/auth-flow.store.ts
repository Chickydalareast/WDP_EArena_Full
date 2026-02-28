// src/features/auth/stores/auth-flow.store.ts
import { create } from 'zustand';

export type AuthFlowStep = 'INPUT_EMAIL' | 'VERIFY_OTP' | 'INPUT_DETAILS';
export type AuthFlowType = 'REGISTER' | 'FORGOT_PASSWORD';

interface AuthFlowState {
  flowType: AuthFlowType;
  step: AuthFlowStep;
  email: string;
  ticket: string | null;
  resendAvailableAt: number | null;
  
  // Actions
  startFlow: (type: AuthFlowType) => void;
  setStep: (step: AuthFlowStep) => void;
  setEmail: (email: string) => void;
  setTicket: (ticket: string) => void;
  setResendAvailableAt: (timestamp: number) => void;
  resetFlow: () => void;
}

export const useAuthFlowStore = create<AuthFlowState>((set) => ({
  flowType: 'REGISTER', // Default
  step: 'INPUT_EMAIL',
  email: '',
  ticket: null,
  resendAvailableAt: null,

  startFlow: (type) => set({ flowType: type, step: 'INPUT_EMAIL', email: '', ticket: null }),
  setStep: (step) => set({ step }),
  setEmail: (email) => set({ email }),
  setTicket: (ticket) => set({ ticket }),
  setResendAvailableAt: (timestamp) => set({ resendAvailableAt: timestamp }),
  
  resetFlow: () => set({
    flowType: 'REGISTER',
    step: 'INPUT_EMAIL',
    email: '',
    ticket: null,
    resendAvailableAt: null,
  }),
}));