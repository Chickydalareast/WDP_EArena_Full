'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { examBuilderService } from '../api/exam-builder.service';
import { FillFromMatrixDTO, FillFromMatrixResponse } from '../types/exam.schema';
import { examQueryKeys } from '../api/query-keys';

export const useFillFromMatrix = (paperId: string) => {
    const queryClient = useQueryClient();

    return useMutation<FillFromMatrixResponse, Error, FillFromMatrixDTO>({
        mutationFn: (data) => examBuilderService.fillFromMatrix(paperId, data),
        onSuccess: (data) => {
            toast.success(data.message || `Đã bốc thành công ${data.addedActualQuestions} câu hỏi mới.`);

            queryClient.invalidateQueries({
                queryKey: examQueryKeys.paperDetail(paperId),
            });
        },
    });
};