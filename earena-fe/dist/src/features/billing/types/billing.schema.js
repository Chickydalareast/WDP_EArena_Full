"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawSchema = exports.depositSchema = void 0;
const zod_1 = require("zod");
exports.depositSchema = zod_1.z.object({
    amount: zod_1.z.coerce
        .number({ message: 'Vui lòng nhập số hợp lệ' })
        .min(10000, 'Số tiền nạp tối thiểu là 10.000đ')
        .max(50000000, 'Giao dịch vượt quá hạn mức 50.000.000đ'),
});
exports.withdrawSchema = zod_1.z.object({
    amount: zod_1.z.coerce
        .number({ message: 'Vui lòng nhập số tiền hợp lệ' })
        .int('Số tiền rút phải là số nguyên')
        .min(100000, 'Số tiền rút tối thiểu là 100.000đ'),
    bankName: zod_1.z.string().trim().min(2, 'Vui lòng nhập tên ngân hàng'),
    accountNumber: zod_1.z.string().trim().min(5, 'Số tài khoản không hợp lệ'),
    accountName: zod_1.z.string().trim().min(2, 'Tên chủ tài khoản không hợp lệ').toUpperCase(),
});
//# sourceMappingURL=billing.schema.js.map