import { z } from 'zod';

export const depositSchema = z.object({
  amount: z.coerce
    .number({ message: 'Vui lòng nhập số hợp lệ' })
    .min(10000, 'Số tiền nạp tối thiểu là 10.000đ')
    .max(50000000, 'Giao dịch vượt quá hạn mức 50.000.000đ'),
});

export type DepositFormDTO = z.infer<typeof depositSchema>;

export interface MockDepositResponse {
  message: string;
  balance: number; // BE trả về balance thay vì newBalance dựa theo code BE wallet.service.ts
}

export type TransactionType = 'DEPOSIT' | 'PAYMENT' | 'REVENUE' | 'REFUND' | 'WITHDRAWAL';

export interface WalletTransaction {
  _id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  postBalance: number;
  description: string;
  createdAt: string;
}

// Bổ sung Schema Rút tiền chuẩn nghiệp vụ (Maker)
export const withdrawSchema = z.object({
  amount: z.coerce
    .number({ message: 'Vui lòng nhập số tiền hợp lệ' })
    .int('Số tiền rút phải là số nguyên')
    .min(100000, 'Số tiền rút tối thiểu là 100.000đ'),
  bankName: z.string().trim().min(2, 'Vui lòng nhập tên ngân hàng'),
  accountNumber: z.string().trim().min(5, 'Số tài khoản không hợp lệ'),
  accountName: z.string().trim().min(2, 'Tên chủ tài khoản không hợp lệ').toUpperCase(),
});

export type WithdrawFormDTO = z.infer<typeof withdrawSchema>;

export interface GetTransactionsParams {
  page?: number;
  limit?: number;
}

export interface PaginatedTransactions {
  data: WalletTransaction[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}