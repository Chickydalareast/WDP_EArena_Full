"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileSchema = void 0;
const zod_1 = require("zod");
exports.ProfileSchema = zod_1.z.object({
    fullName: zod_1.z.string().max(50, 'Tên không được vượt quá 50 ký tự').optional(),
    avatar: zod_1.z
        .string()
        .regex(/^(https?:\/\/res\.cloudinary\.com\/.*|https?:\/\/.*\.googleusercontent\.com\/.*)$/, 'Nguồn ảnh đại diện không hợp lệ')
        .optional()
        .or(zod_1.z.literal('')),
    phone: zod_1.z
        .string()
        .regex(/^(84|0[3|5|7|8|9])[0-9]{8}$/, 'Số điện thoại không đúng định dạng VN')
        .optional()
        .or(zod_1.z.literal('')),
    dateOfBirth: zod_1.z.string().optional(),
});
//# sourceMappingURL=profile.schema.js.map