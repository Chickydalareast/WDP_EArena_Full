'use client';

import { useQuery } from '@tanstack/react-query';
import { examBuilderService } from '../api/exam-builder.service';
import { examQueryKeys } from '../api/query-keys';

export const useExamMatrices = (subjectId?: string) => {
    return useQuery({
        queryKey: examQueryKeys.matrixList({ subjectId }),
        queryFn: () => examBuilderService.getMatrices({ subjectId, limit: 100 }),
        enabled: !!subjectId,
        staleTime: 5 * 60 * 1000,
    });
};