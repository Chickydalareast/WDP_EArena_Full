import { create } from 'zustand';

export type AuthFlowStep = 'INPUT_EMAIL' | 'VERIFY_OTP' | 'INPUT_DETAILS';
export type AuthFlowType = 'REGISTER' | 'FORGOT_PASSWORD';
export type UserRole = 'STUDENT' | 'TEACHER'; 

interface AuthFlowState {
  flowType: AuthFlowType;
  step: AuthFlowStep;
  email: string;
  ticket: string | null;
  resendAvailableAt: number | null;
  role: UserRole; 
  
  // Actions
  startFlow: (type: AuthFlowType) => void;
  setStep: (step: AuthFlowStep) => void;
  setEmail: (email: string) => void;
  setTicket: (ticket: string) => void;
  setResendAvailableAt: (timestamp: number) => void;
  setEmailAndRole: (email: string, role: UserRole) => void;
  resetFlow: () => void;
}

export const useAuthFlowStore = create<AuthFlowState>((set) => ({
  flowType: 'REGISTER', 
  step: 'INPUT_EMAIL',
  email: '',
  ticket: null,
  resendAvailableAt: null,
  role: 'STUDENT',

  startFlow: (type) => set({ flowType: type, step: 'INPUT_EMAIL', email: '', ticket: null }),
  setStep: (step) => set({ step }),
  setEmail: (email) => set({ email }),
  setTicket: (ticket) => set({ ticket }),
  setResendAvailableAt: (timestamp) => set({ resendAvailableAt: timestamp }),
  setEmailAndRole: (email, role) => set({ email, role }),
  
  resetFlow: () => set({
    flowType: 'REGISTER',
    step: 'INPUT_EMAIL',
    email: '',
    ticket: null,
    resendAvailableAt: null,
    role: 'STUDENT', 
  }),
}));