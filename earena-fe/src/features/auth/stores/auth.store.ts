import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { PricingPlanCode } from '@/features/subscriptions/types/subscription.schema';

export interface UserSession {
  id: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  fullName?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string | Date;
  balance: number;
  
  subscription: {
    planId: string;
    planCode: PricingPlanCode;
    expiresAt: string | null;
    isExpired: boolean;
  } | null;
  
  subjects?: {
    id: string;
    name: string;
  }[];

  teacherVerificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuth: (user: UserSession) => void;
  clearAuth: () => void;
  setInitialized: () => void;
  updateBalance: (newBalance: number) => void;
  
  updateUserSubscription: (payload: { planId: string; planCode: PricingPlanCode; expiresAt: string }) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false,

      setAuth: (user) => set({ user, isAuthenticated: true, isInitialized: true }, false, 'auth/setAuth'),

      clearAuth: () => set({ user: null, isAuthenticated: false, isInitialized: true }, false, 'auth/clearAuth'),

      setInitialized: () => set({ isInitialized: true }, false, 'auth/setInit'),

      updateBalance: (newBalance) => set(
        (state) => ({
          user: state.user ? { ...state.user, balance: newBalance } : null,
        }),
        false,
        'auth/updateBalance'
      ),

      updateUserSubscription: ({ planId, planCode, expiresAt }) => set(
        (state) => {
          if (!state.user) return state;

          return {
            user: {
              ...state.user,
              subscription: {
                ...(state.user.subscription || {}),
                planId,
                planCode,
                expiresAt,
                isExpired: false,
              }
            }
          };
        },
        false,
        'auth/updateSubscription'
      ),
    }),
    { name: 'AuthStore' }
  )
);