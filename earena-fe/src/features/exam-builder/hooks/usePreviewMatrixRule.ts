'use client';

import { useQuery } from '@tanstack/react-query';
import { examBuilderService } from '../api/exam-builder.service';
import { MatrixRuleDTO } from '../types/exam.schema';
import { examQueryKeys } from '../api/query-keys';

export const usePreviewMatrixRule = (paperId: string, payload: MatrixRuleDTO) => {
    return useQuery({
        queryKey: examQueryKeys.previewRule(paperId, payload),
        queryFn: async ({ signal }) => {
            const cleanPayload = Object.fromEntries(
                Object.entries(payload).filter(([_, v]) => Array.isArray(v) ? v.length > 0 : v !== undefined)
            ) as MatrixRuleDTO;

            return examBuilderService.previewMatrixRule(paperId, cleanPayload, { signal });
        },
        enabled: !!paperId && payload.folderIds && payload.folderIds.length > 0,
        staleTime: 60 * 1000,
        retry: false,
    });
};