import { useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService } from '../api/billing.service';
import { WithdrawFormDTO } from '../types/billing.schema';
import { courseQueryKeys } from '@/features/courses/api/course-keys';
import { WALLET_TRANSACTIONS_KEY } from './useBillingFlows';
import { toast } from 'sonner';
import { parseApiError } from '@/shared/lib/error-parser';

export const useWithdrawMutation = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: WithdrawFormDTO) => billingService.withdraw(payload),
        onSuccess: (data) => {
            toast.success('Đã gửi yêu cầu rút tiền', {
                description: data.message,
            });

            queryClient.invalidateQueries({ queryKey: courseQueryKeys.walletBalance() });
            queryClient.invalidateQueries({ queryKey: WALLET_TRANSACTIONS_KEY });

            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error) => {
            const parsed = parseApiError(error);
            toast.error('Rút tiền thất bại', { description: parsed.message });
        }
    });
};