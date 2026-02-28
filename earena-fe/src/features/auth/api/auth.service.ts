import { axiosClient } from '@/shared/lib/axios-client';
import { UserSession } from '../stores/auth.store';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { LoginDTO } from '../types/auth.schema';

export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

export interface SendOtpDTO {
  email: string;
  type: 'REGISTER' | 'FORGOT_PASSWORD';
}

export interface VerifyOtpDTO extends SendOtpDTO {
  otp: string;
}

export interface RegisterDTO {
  email: string;
  fullName: string;
  password: string;
  ticket: string;
}

export interface ResetPasswordDTO {
  email: string;
  newPassword: string;
  ticket: string;
}

export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}

export const authService = {
  login: async (data: LoginDTO): Promise<UserSession> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, data); 
  },
  
  logout: async (): Promise<void> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  sendOtp: async (data: SendOtpDTO): Promise<void> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.SEND_OTP, data);
  },

  verifyOtp: async (data: VerifyOtpDTO): Promise<{ ticket: string }> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, data);
  },

  register: async (data: RegisterDTO): Promise<UserSession> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
  },

  resetPassword: async (data: ResetPasswordDTO): Promise<{ message: string }> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },

  changePassword: async (data: ChangePasswordDTO): Promise<{ message: string }> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  getProfile: async (): Promise<UserSession> => {
    return axiosClient.get(API_ENDPOINTS.AUTH.ME);
  },
};