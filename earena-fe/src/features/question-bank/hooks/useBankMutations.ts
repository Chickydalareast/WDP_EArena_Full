'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { questionBankService } from '../api/question-bank.service';
import { CloneQuestionDTO, BulkCloneQuestionsDTO, BulkDeleteQuestionsDTO, AiQuestionBuilderDTO, OrganizeQuestionsPayload, BulkAutoTagDTO, BulkPublishQuestionsDTO } from '../types/question-bank.schema';
import { BANK_QUESTIONS_KEY } from './useBankQueries';
import { ApiError, parseApiError } from '@/shared/lib/error-parser';
import { QuestionItemDTO } from '@/features/exam-builder/types/exam.schema';
import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { FOLDER_QUERY_KEY } from './useFolderMutations';
import { useQuestionBankStore } from '../stores/question-bank.store';

export const useCloneQuestion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CloneQuestionDTO }) => questionBankService.cloneQuestion(id, data),
        onSuccess: () => {
            toast.success('Đã nhân bản câu hỏi thành công!');
            queryClient.invalidateQueries({ queryKey: BANK_QUESTIONS_KEY });
        },
        onError: (err: ApiError) => toast.error('Lỗi nhân bản', { description: err.message })
    });
};

export const useBulkCloneQuestions = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: BulkCloneQuestionsDTO) => questionBankService.bulkCloneQuestions(data),
        onSuccess: () => {
            toast.success('Đã nhân bản hàng loạt thành công!');
            queryClient.invalidateQueries({ queryKey: BANK_QUESTIONS_KEY });
        },
        onError: (err: ApiError) => toast.error('Lỗi nhân bản hàng loạt', { description: err.message })
    });
};

export const useBulkDeleteQuestions = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: BulkDeleteQuestionsDTO) => questionBankService.bulkDeleteQuestions(data),
        onSuccess: () => {
            toast.success('Đã xóa thành công các câu hỏi được chọn!');
            queryClient.invalidateQueries({ queryKey: BANK_QUESTIONS_KEY });
        },
        onError: (err: ApiError) => toast.error('Lỗi khi xóa', { description: err.message })
    });
};

export const useCreateBankQuestions = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ folderId, questionsData }: { folderId: string, questionsData: QuestionItemDTO[] }) => {
            // Gọi qua Service, không dùng raw axiosClient
            return questionBankService.bulkCreateQuestions({
                folderId,
                questions: questionsData
            });
        },
        onSuccess: () => {
            toast.success('Thành công', { description: 'Đã tạo câu hỏi và lưu vào ngân hàng!' });
            queryClient.invalidateQueries({ queryKey: BANK_QUESTIONS_KEY });
        },
        onError: (err: ApiError) => {
            // Ép kiểu an toàn (Stringify) để chống crash Next.js [object Object]
            const errorMessage = typeof err.message === 'string'
                ? err.message
                : JSON.stringify(err.message || 'Có lỗi xảy ra từ máy chủ');

            toast.error('Lỗi tạo câu hỏi', { description: errorMessage });
        }
    });
};



export const useGenerateAiQuestions = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AiQuestionBuilderDTO) => questionBankService.generateAiQuestions(data),

        onSuccess: (data) => {
            toast.success('AI phân tích thành công!', {
                description: data.message || `Đã tự động bóc tách và tạo ${data.questionsGenerated} câu hỏi.`,
                duration: 6000,
            });

            queryClient.invalidateQueries({ queryKey: BANK_QUESTIONS_KEY });
        },

        onError: (error: unknown) => {
            const parsedError = parseApiError(error);

            const isTimeout = parsedError.statusCode === 408 || error?.toString().includes('timeout');

            toast.error(isTimeout ? 'AI đang quá tải (Timeout)' : 'Quá trình phân tích thất bại', {
                description: isTimeout
                    ? 'Đề thi của bạn quá dài hoặc hệ thống LLM đang bị nghẽn. Vui lòng cắt nhỏ đề thi và thử lại.'
                    : parsedError.message,
                duration: 8000,
            });
        },
    });
};

export const usePreviewOrganize = () => {
    return useMutation({
        mutationFn: (data: OrganizeQuestionsPayload) => questionBankService.previewAutoOrganize(data),
        onError: (err: ApiError) => {
            if (err.statusCode === 400) {
                toast.error('Dữ liệu không hợp lệ', {
                    description: err.message || 'Các câu hỏi chọn có thể thiếu thuộc tính Chuyên đề/Độ khó.'
                });
            } else if (err.statusCode === 403) {
                toast.error('Thiếu cấu hình', {
                    description: 'Vui lòng cập nhật Môn học đang giảng dạy trong Profile trước khi dùng tính năng này.'
                });
            } else {
                toast.error('Lỗi mô phỏng', { description: err.message });
            }
        }
    });
};

export const useExecuteOrganize = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: OrganizeQuestionsPayload) => questionBankService.executeAutoOrganize(data),
        onSuccess: (res) => {
            toast.success('Tổ chức thành công!', { description: res.message });

            queryClient.invalidateQueries({ queryKey: FOLDER_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: BANK_QUESTIONS_KEY });
        },
        onError: (err: ApiError) => {
            toast.error('Lỗi thực thi sắp xếp', { description: err.message });
        }
    });
};

export const useBulkAutoTag = () => {
    return useMutation({
        mutationFn: (data: BulkAutoTagDTO) => questionBankService.bulkAutoTag(data),
        onSuccess: (_, variables) => {
            const store = useQuestionBankStore.getState();
            
            store.addProcessingIds(variables.questionIds);
            
            store.clearQuestionSelection();
            
            toast.success('Hệ thống đang xử lý ngầm!', {
                description: 'Yêu cầu AI phân loại đã được đưa vào hàng đợi. Quá trình này có thể mất vài phút.',
                duration: 5000,
            });
        },
        onError: (err: ApiError) => {
            toast.error('Không thể thực hiện yêu cầu', { 
                description: err.message || 'Lỗi kết nối hoặc tài khoản không hợp lệ.' 
            });
        }
    });
};

export const useBulkPublishQuestions = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: BulkPublishQuestionsDTO) => questionBankService.bulkPublishQuestions(data),
        onSuccess: (data) => {
            toast.success('Xuất bản thành công', { 
                description: `Đã chuyển ${data.publishedCount} câu hỏi sang trạng thái Chính thức.` 
            });
            queryClient.invalidateQueries({ queryKey: BANK_QUESTIONS_KEY });
        },
        onError: (err: ApiError) => {
            toast.error('Không thể xuất bản', { 
                description: err.message || 'Đã có lỗi xảy ra khi kiểm tra dữ liệu.' 
            });
        }
    });
};