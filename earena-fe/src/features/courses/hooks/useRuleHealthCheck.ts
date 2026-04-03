import { useQuery } from '@tanstack/react-query';
import { courseService } from '../api/course.service';
import { QuizRulePreviewPayloadDTO } from '../types/course.schema';

export const useRuleHealthCheck = (payload: QuizRulePreviewPayloadDTO | null) => {
    return useQuery({
        queryKey: ['quiz-rule-health', payload],
        queryFn: async () => {
            if (!payload) throw new Error('Missing payload');
            const response = await courseService.previewQuizRule(payload);
            return (response as any).data || response;
        },
        enabled: !!payload && payload.folderIds.length > 0 && payload.limit > 0,
        staleTime: 1000 * 60 * 5,
        retry: 0,
    });
};