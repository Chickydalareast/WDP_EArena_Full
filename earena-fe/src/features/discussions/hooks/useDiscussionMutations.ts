'use client';

import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { discussionService } from '../api/discussion.service';
import { discussionQueryKeys } from '../api/discussion-keys';
import { parseApiError } from '@/shared/lib/error-parser';
import {
    CreateQuestionDTO,
    CreateReplyDTO,
    GetQuestionsResponse,
    SortOption
} from '../types/discussion.schema';

export const useDiscussionMutations = (
    courseId: string,
    lessonId: string,
    sortBy: SortOption = 'recent'
) => {
    const queryClient = useQueryClient();

    const postQuestionMutation = useMutation({
        mutationFn: (payload: CreateQuestionDTO) => discussionService.postQuestion(payload),
        onSuccess: () => {
            toast.success('Đã gửi câu hỏi thảo luận thành công!');
            queryClient.invalidateQueries({
                queryKey: discussionQueryKeys.questions(courseId, lessonId, sortBy),
            });
        },
        onError: (error) => {
            const parsedError = parseApiError(error);
            toast.error('Lỗi khi gửi câu hỏi', {
                description: parsedError.message || 'Vui lòng thử lại sau.'
            });
        }
    });

    const postReplyMutation = useMutation({
        mutationFn: (payload: CreateReplyDTO) => discussionService.postReply(payload),
        onSuccess: (_, variables) => {
            toast.success('Phản hồi thành công!');

            const { parentId } = variables;

            queryClient.invalidateQueries({
                queryKey: discussionQueryKeys.replies(courseId, parentId),
            });

            queryClient.invalidateQueries({
                queryKey: [...discussionQueryKeys.all, 'course-questions', courseId],
            });

            const questionsQueryKey = discussionQueryKeys.questions(courseId, lessonId, sortBy);
            queryClient.setQueryData<InfiniteData<GetQuestionsResponse>>(
                questionsQueryKey,
                (oldData) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        pages: oldData.pages.map(page => ({
                            ...page,
                            data: page.data.map(question => {
                                if (question.id === parentId) {
                                    return {
                                        ...question,
                                        replyCount: question.replyCount + 1,
                                        lastRepliedAt: new Date().toISOString()
                                    };
                                }
                                return question;
                            })
                        }))
                    };
                }
            );

            if (sortBy === 'recent') {
                queryClient.invalidateQueries({ queryKey: questionsQueryKey });
            }
        },
        onError: (error) => {
            const parsedError = parseApiError(error);
            toast.error('Lỗi khi gửi phản hồi', {
                description: parsedError.message || 'Vui lòng thử lại sau.'
            });
        }
    });

    return {
        postQuestion: postQuestionMutation,
        postReply: postReplyMutation,
    };
};