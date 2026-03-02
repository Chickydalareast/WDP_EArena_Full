import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email không được để trống')
    .email('Định dạng email không hợp lệ'),
  password: z.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(50, 'Mật khẩu vượt quá độ dài cho phép'),
});

// Infer Type từ Zod Schema để đồng bộ 1:1 với Backend DTO
export type LoginDTO = z.infer<typeof loginSchema>;

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  };
}

export const registerEmailSchema = z.object({
  email: z.string().min(1, 'Email không được để trống').email('Định dạng email không hợp lệ'),
});

// Schema Bước 2: Nhập OTP
export const verifyOtpSchema = z.object({
  otp: z.string().length(6, 'Mã OTP phải có đúng 6 chữ số').regex(/^\d+$/, 'Mã OTP chỉ chứa số'),
});

// Schema Bước 3: Nhập Thông tin chi tiết
export const registerDetailsSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100, 'Họ tên quá dài'),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ viết hoa')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export type RegisterEmailDTO = z.infer<typeof registerEmailSchema>;
export type VerifyOtpFormDTO = z.infer<typeof verifyOtpSchema>;
export type RegisterDetailsDTO = z.infer<typeof registerDetailsSchema>;