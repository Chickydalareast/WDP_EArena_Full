'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { examBuilderService } from '../api/exam-builder.service';
import { GenerateExamDTO, GenerateExamResponse } from '../types/exam.schema';
import { ROUTES } from '@/config/routes';

export const useGenerateExam = () => {
    const router = useRouter();

    return useMutation<GenerateExamResponse, Error, GenerateExamDTO>({
        mutationFn: examBuilderService.generateExam,
        onSuccess: (data) => {
            toast.success(
                `Thành công! Đã tạo đề thi gồm ${data.totalActualQuestions} câu hỏi (Tương đương ${data.totalItems} khối hiển thị).`
            );
            // Điều hướng thẳng vào builder board
            router.push(`${ROUTES.TEACHER.EXAMS}/${data.examId}/builder?paperId=${data.examPaperId}`);
        },
        onError: (error: any) => {
            // Đánh chặn lỗi 400 Knapsack từ BE và hiện Toast đỏ
            if (error?.statusCode === 400 && error?.message) {
                toast.error('Lỗi Ma Trận Sinh Đề', {
                    description: error.message,
                    duration: 8000, // Hiển thị lâu hơn để GV kịp đọc
                });
            } else {
                toast.error('Có lỗi xảy ra', { description: error?.message || 'Không thể sinh đề lúc này' });
            }
        },
    });
};