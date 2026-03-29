import { z } from 'zod';

export const ProfileSchema = z.object({
  fullName: z.string().max(50, 'Tên không được vượt quá 50 ký tự').optional(),
  avatar: z
    .string()
    .regex(
      /^(https?:\/\/res\.cloudinary\.com\/.*|https?:\/\/.*\.googleusercontent\.com\/.*)$/,
      'Nguồn ảnh đại diện không hợp lệ'
    )
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^(84|0[3|5|7|8|9])[0-9]{8}$/, 'Số điện thoại không đúng định dạng VN')
    .optional()
    .or(z.literal('')),
  dateOfBirth: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof ProfileSchema>;