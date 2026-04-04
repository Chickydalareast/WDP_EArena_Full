import { useQuery } from '@tanstack/react-query';
import { courseService } from '../api/course.service';
import { QuizRulePreviewPayloadDTO } from '../types/course.schema';

export const useQuizRuleHealth = (payload: QuizRulePreviewPayloadDTO | null) => {
    
    const isPassageValid = payload?.questionType === 'PASSAGE' 
        ? (payload.subQuestionLimit !== undefined && payload.subQuestionLimit >= 1)
        : true;

    const canFetch = !!payload &&
        payload.folderIds.length > 0 &&
        payload.limit > 0 &&
        !!payload.questionType &&
        isPassageValid;

    return useQuery({
        queryKey: ['quiz-rule-health', payload],
        queryFn: async ({ signal }) => {
            if (!payload) throw new Error('Missing payload');
            const response = await courseService.previewQuizRule(payload, signal);
            return (response as any).data || response;
        },
        enabled: canFetch,
        staleTime: 1000 * 60 * 2,
        retry: 0,
    });
};