import { axiosClient } from '@/shared/lib/axios-client';
import { UserSession } from '../stores/auth.store';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { env } from '@/config/env';
import { LoginDTO } from '../types/auth.schema';
import { AuthResponse } from '../types/auth.schema';

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

export interface RegisterQualificationItem {
  url: string;
  name: string;
}

export interface RegisterDTO {
  email: string;
  fullName: string;
  password: string;
  ticket: string;
  role: 'STUDENT' | 'TEACHER';
  subjectIds?: string[];
  qualifications?: RegisterQualificationItem[];
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

  /** Upload ảnh bằng cấp trong bước đăng ký (sau OTP). Dùng fetch để tránh header JSON mặc định của axios. */
  uploadRegisterQualification: async (params: {
    email: string;
    ticket: string;
    name: string;
    file: File;
  }): Promise<RegisterQualificationItem> => {
    const fd = new FormData();
    fd.append('file', params.file);
    fd.append('email', params.email);
    fd.append('ticket', params.ticket);
    fd.append('name', params.name);

    const base = env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
    const res = await fetch(`${base}${API_ENDPOINTS.AUTH.REGISTER_QUALIFICATION_UPLOAD}`, {
      method: 'POST',
      body: fd,
      credentials: 'include',
    });

    const json = (await res.json().catch(() => ({}))) as {
      message?: string | string[];
      data?: RegisterQualificationItem;
    };
    if (!res.ok) {
      const msg = json?.message ?? 'Không thể tải ảnh lên. Vui lòng thử lại.';
      const text = Array.isArray(msg) ? msg.join(', ') : String(msg);
      throw new Error(text);
    }
    const payload = json.data;
    if (!payload?.url) throw new Error('Phản hồi máy chủ không hợp lệ.');
    return payload;
  },

  resetPassword: async (data: ResetPasswordDTO): Promise<{ message: string }> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },

  changePassword: async (data: ChangePasswordDTO): Promise<{ message: string }> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  googleLogin: async (data: { idToken: string }): Promise<UserSession> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.GOOGLE, data);
  },
  
  getProfile: async (): Promise<UserSession> => {
    return axiosClient.get(API_ENDPOINTS.AUTH.ME);
  },
};