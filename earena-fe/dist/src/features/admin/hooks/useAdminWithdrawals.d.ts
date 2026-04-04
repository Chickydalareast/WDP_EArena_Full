import { GetWithdrawalsParams } from '../types/admin-wallet.schema';
export declare const ADMIN_WITHDRAWALS_KEY: string[];
export declare const useAdminWithdrawals: (params: GetWithdrawalsParams) => any;
export declare const useProcessWithdrawal: (onSuccessCallback?: () => void) => any;
