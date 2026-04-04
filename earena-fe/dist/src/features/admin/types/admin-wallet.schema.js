"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processWithdrawalSchema = void 0;
const zod_1 = require("zod");
exports.processWithdrawalSchema = zod_1.z.discriminatedUnion('action', [
    zod_1.z.object({
        action: zod_1.z.literal('APPROVE'),
    }),
    zod_1.z.object({
        action: zod_1.z.literal('REJECT'),
        rejectionReason: zod_1.z.string().trim().min(5, 'Vui lòng nhập lý do từ chối chi tiết (ít nhất 5 ký tự)'),
    }),
]);
//# sourceMappingURL=admin-wallet.schema.js.map