import { UseQueryResult } from '@tanstack/react-query';
import { CourseBasic } from '@/features/courses/types/course.schema';
export declare const WALLET_TRANSACTIONS_KEY: string[];
export declare const useCheckoutFlow: () => {
    handleCheckout: (course: CourseBasic) => Promise<void>;
    isProcessing: any;
};
export declare const useMockDeposit: () => any;
export declare const useSyncWallet: () => UseQueryResult<{
    balance: number;
    status: string;
}, Error>;
export declare const useMyTransactions: (page?: number, limit?: number) => any;
