import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface UserSession {
  id: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  fullName?: string;
}

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  isInitialized: boolean; 
  setAuth: (user: UserSession) => void;
  clearAuth: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false,
      
      setAuth: (user) => set({ user, isAuthenticated: true }, false, 'auth/setAuth'),
      clearAuth: () => set({ user: null, isAuthenticated: false }, false, 'auth/clearAuth'),
      setInitialized: () => set({ isInitialized: true }, false, 'auth/setInit'),
    }),
    { name: 'AuthStore' }
  )
);