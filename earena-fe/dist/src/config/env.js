"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NEXT_PUBLIC_API_URL: zod_1.z.string().url("API URL phải hợp lệ"),
    NEXT_PUBLIC_APP_URL: zod_1.z.string().url("App URL phải hợp lệ"),
    NEXT_PUBLIC_FIREBASE_API_KEY: zod_1.z.string().optional(),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: zod_1.z.string().optional(),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: zod_1.z.string().optional(),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: zod_1.z.string().optional(),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: zod_1.z.string().optional(),
    NEXT_PUBLIC_FIREBASE_APP_ID: zod_1.z.string().optional(),
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: zod_1.z.string().optional(),
});
const _env = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
});
if (!_env.success) {
    console.error('❌ Lỗi cấu hình biến môi trường:', _env.error.format());
    throw new Error('Thiếu hoặc sai định dạng biến môi trường trong file .env');
}
exports.env = _env.data;
//# sourceMappingURL=env.js.map