"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDetailsSchema = exports.qualificationSchema = exports.verifyOtpSchema = exports.registerEmailSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().min(1, "Email hoặc SĐT không được để trống").trim(),
    password: zod_1.z.string().min(1, "Vui lòng nhập mật khẩu"),
    rememberMe: zod_1.z.boolean().optional().default(false),
});
exports.registerEmailSchema = zod_1.z.object({
    email: zod_1.z.string().email("Định dạng email không hợp lệ").trim().toLowerCase(),
    role: zod_1.z.enum(["STUDENT", "TEACHER"]).default("STUDENT"),
});
exports.verifyOtpSchema = zod_1.z.object({
    otp: zod_1.z
        .string()
        .length(6, "Mã OTP phải có đúng 6 chữ số")
        .regex(/^\d+$/, "Mã OTP chỉ chứa số"),
});
exports.qualificationSchema = zod_1.z.object({
    url: zod_1.z.string().url("URL không hợp lệ"),
    name: zod_1.z.string().min(1, "Tên bằng cấp không được để trống"),
});
exports.registerDetailsSchema = zod_1.z.object({
    role: zod_1.z.enum(['STUDENT', 'TEACHER']).default('STUDENT'),
    fullName: zod_1.z.string()
        .min(2, 'Họ tên phải có ít nhất 2 ký tự')
        .max(100, 'Họ tên quá dài')
        .trim(),
    password: zod_1.z.string()
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ viết hoa')
        .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số'),
    confirmPassword: zod_1.z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    subjectId: zod_1.z.string().optional(),
    qualifications: zod_1.z.array(exports.qualificationSchema).optional(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
})
    .superRefine((data, ctx) => {
    if (data.role === 'TEACHER') {
        if (!data.subjectId || data.subjectId.trim() === '') {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Giáo viên bắt buộc phải chọn 1 chuyên môn",
                path: ["subjectId"],
            });
        }
    }
});
//# sourceMappingURL=auth.schema.js.map