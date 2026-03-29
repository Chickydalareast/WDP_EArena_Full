import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminWalletService } from '../api/admin-wallet.service';
import { GetWithdrawalsParams, ProcessWithdrawalDTO } from '../types/admin-wallet.schema';
import { toast } from 'sonner';
import { parseApiError } from '@/shared/lib/error-parser';

export const ADMIN_WITHDRAWALS_KEY = ['admin', 'withdrawals'];

export const useAdminWithdrawals = (params: GetWithdrawalsParams) => {
    return useQuery({
        queryKey: [...ADMIN_WITHDRAWALS_KEY, params],
        queryFn: () => adminWalletService.getWithdrawals(params),
        staleTime: 1000 * 60,
    });
};

export const useProcessWithdrawal = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: ProcessWithdrawalDTO }) =>
            adminWalletService.processWithdrawal(id, payload),
        onSuccess: (data) => {
            toast.success('Xử lý thành công', { description: data.message });
            queryClient.invalidateQueries({ queryKey: ADMIN_WITHDRAWALS_KEY });
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error) => {
            const parsed = parseApiError(error);
            toast.error('Lỗi xử lý yêu cầu', { description: parsed.message });
        },
    });
};