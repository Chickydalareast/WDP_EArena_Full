'use client';

import { useQuery } from '@tanstack/react-query';
import { courseService } from '../api/course.service';
import { QuizBuilderPreviewPayloadDTO } from '../types/course.schema';
import { MatrixSectionDTO } from '@/features/exam-builder/types/exam.schema';

const hasValidRule = (sections: MatrixSectionDTO[]): boolean =>
    sections.some((section) =>
        section.rules.some((rule) => rule.folderIds.length > 0 && rule.limit >= 1 && !!rule.questionType),
    );

export const useDynamicPreview = (payload: QuizBuilderPreviewPayloadDTO | null) => {
    const isEnabled =
        payload !== null &&
        (!!payload.matrixId ||
            (Array.isArray(payload.adHocSections) &&
                payload.adHocSections.length > 0 &&
                hasValidRule(payload.adHocSections)));

    return useQuery({
        queryKey: ['quiz-builder', 'dry-run-preview', payload],
        queryFn: async ({ signal }) => {
            const response = await courseService.previewQuizConfig(payload!, signal);
            return (response as any).data || response;
        },
        enabled: isEnabled,
        staleTime: 30 * 1000,
        retry: false,
        gcTime: 60 * 1000,
    });
};