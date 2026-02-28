import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url("API URL phải hợp lệ"),
  NEXT_PUBLIC_APP_URL: z.string().url("App URL phải hợp lệ"),
});

const _env = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

if (!_env.success) {
  console.error('❌ Lỗi cấu hình biến môi trường:', _env.error.format());
  throw new Error('Thiếu hoặc sai định dạng biến môi trường trong file .env');
}

export const env = _env.data;