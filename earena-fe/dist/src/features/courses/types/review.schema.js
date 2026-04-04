"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyReviewSchema = exports.createReviewSchema = void 0;
const zod_1 = require("zod");
exports.createReviewSchema = zod_1.z.object({
    rating: zod_1.z
        .number({ message: 'Vui lòng chọn số sao đánh giá.' })
        .int('Số sao phải là số nguyên.')
        .min(1, 'Đánh giá tối thiểu 1 sao.')
        .max(5, 'Đánh giá tối đa 5 sao.'),
    comment: zod_1.z.string().optional(),
});
exports.replyReviewSchema = zod_1.z.object({
    reply: zod_1.z.string().trim().min(1, 'Nội dung phản hồi không được để trống.'),
});
//# sourceMappingURL=review.schema.js.map