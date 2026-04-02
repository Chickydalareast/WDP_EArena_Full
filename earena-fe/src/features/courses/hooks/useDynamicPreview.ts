'use client';

import { useQuery } from '@tanstack/react-query';
import { examBuilderService } from '@/features/exam-builder/api/exam-builder.service';
import { DynamicPreviewRequestDTO } from '@/features/exam-builder/types/exam.schema';

export const useDynamicPreview = (payload: DynamicPreviewRequestDTO | null) => {
    return useQuery({
        queryKey: ['dynamic-preview', payload],
        queryFn: async () => {
            if (!payload) throw new Error('No payload');
            return examBuilderService.previewDynamicExam(payload);
        },
        enabled: !!payload && (
            !!payload.matrixId ||
            (!!payload.adHocSections && payload.adHocSections.length > 0) ||
            (!!payload.rules && payload.rules.length > 0)
        ),
        staleTime: 30 * 1000,
        retry: false,
    });
};