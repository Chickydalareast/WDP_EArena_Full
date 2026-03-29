import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email hoặc SĐT không được để trống").trim(),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginFormDTO = z.infer<typeof loginSchema>;
export type LoginDTO = Omit<LoginFormDTO, "rememberMe">;

export const registerEmailSchema = z.object({
  email: z.string().email("Định dạng email không hợp lệ").trim().toLowerCase(),
  role: z.enum(["STUDENT", "TEACHER"]).default("STUDENT"),
});

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .length(6, "Mã OTP phải có đúng 6 chữ số")
    .regex(/^\d+$/, "Mã OTP chỉ chứa số"),
});

export const registerDetailsSchema = z.object({
  role: z.enum(['STUDENT', 'TEACHER']).default('STUDENT'),

  fullName: z.string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên quá dài')
    .trim(),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ viết hoa')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),

  subjectId: z.string().optional(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
})
.superRefine((data, ctx) => {
  if (data.role === 'TEACHER') {
    if (!data.subjectId || data.subjectId.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Giáo viên bắt buộc phải chọn 1 chuyên môn",
        path: ["subjectId"],
      });
    }
  }
});

export type RegisterDetailsDTO = z.infer<typeof registerDetailsSchema>;
export type RegisterEmailDTO = z.infer<typeof registerEmailSchema>;
export type VerifyOtpFormDTO = z.infer<typeof verifyOtpSchema>;

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
    balance: number;
    subscription?: string | null;
    avatar?: string;
  };
}
