'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { questionBankService } from '../api/question-bank.service';
import { FetchBankQuestionsParams, BulkMoveQuestionsDTO } from '../types/question-bank.schema';
import { FOLDER_QUERY_KEY } from './useFolderMutations';
import { ApiError } from '@/shared/lib/error-parser';

export const BANK_QUESTIONS_KEY = ['question-bank', 'questions'];
export const SUGGEST_FOLDERS_KEY = ['question-bank', 'suggest-folders'];

export const useFolderTree = () => {
    return useQuery({
        queryKey: FOLDER_QUERY_KEY,
        queryFn: () => questionBankService.getFolderTree(),
        staleTime: 5 * 60 * 1000,
    });
};

export const useBankQuestions = (params: FetchBankQuestionsParams, isPollingActive: boolean = false) => {
    return useQuery({
        queryKey: [...BANK_QUESTIONS_KEY, params],
        queryFn: () => questionBankService.getQuestionsByFolder(params),
        staleTime: 60 * 1000,
    
        enabled: !!params.folderIds && params.folderIds.length > 0,
        refetchInterval: isPollingActive ? 15000 : false,
        refetchIntervalInBackground: isPollingActive, 
    });
};
export const useBulkMoveQuestions = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: BulkMoveQuestionsDTO) => questionBankService.bulkMoveQuestions(data),
        onSuccess: () => {
            toast.success('Di chuyển thành công!');
            queryClient.invalidateQueries({ queryKey: BANK_QUESTIONS_KEY });
        },
        onError: (err: ApiError) => {
            toast.error('Lỗi di chuyển', { description: err.message });
        }
    });
};



// export const useSuggestFolders = (questionIds: string[], isOpen: boolean) => {
//     return useQuery({
//         // Cache dựa trên list ID, giúp tránh gọi lại nếu list ID không đổi
//         queryKey: [...SUGGEST_FOLDERS_KEY, questionIds],
//         queryFn: async () => {
//             try {
//                 return await questionBankService.suggestFolders({ questionIds });
//             } catch (error) {
//                 // Bắt lỗi 400 Bad Request theo yêu cầu BE và hiển thị Toast
//                 const err = error as ApiError;
//                 toast.error('Không thể lấy gợi ý thư mục', {
//                     description: err.message || 'Dữ liệu đầu vào không hợp lệ',
//                 });
//                 throw err;
//             }
//         },
//         // Chặn request nếu mảng rỗng HOẶC Modal chưa mở (tránh gọi API thừa thãi)
//         enabled: questionIds.length > 0 && isOpen,
//         // Dữ liệu gợi ý không cần thiết phải quá fresh, để stale time 1 phút
//         staleTime: 60 * 1000, 
//         // Tránh retry liên tục nếu lỗi 400
//         retry: (failureCount, error) => {
//             const err = error as ApiError;
//             if (err.statusCode === 400) return false;
//             return failureCount < 2;
//         }
//     });
// };