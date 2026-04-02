'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { examBuilderService } from '../api/exam-builder.service';
import { UpdatePointsDTO } from '../types/exam.schema';
import { examQueryKeys } from '../api/query-keys';

export const useUpdatePoints = (paperId: string) => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, UpdatePointsDTO>({
        mutationFn: (data) => examBuilderService.updatePoints(paperId, data),
        onSuccess: () => {
            toast.success('Đã lưu điểm số thành công.');
            queryClient.invalidateQueries({
                queryKey: examQueryKeys.paperDetail(paperId),
            });
        },
        onError: (error) => {
            toast.error('Lỗi lưu điểm', { description: error.message });
        }
    });
};