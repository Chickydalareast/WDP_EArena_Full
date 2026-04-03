import { useMutation } from '@tanstack/react-query';
import { courseService } from '../api/course.service';
import { QuizBuilderPreviewPayloadDTO } from '../types/course.schema';
import { toast } from 'sonner';
import { parseApiError } from '@/shared/lib/error-parser';

export const usePreviewQuizConfig = () => {
    return useMutation({
        mutationFn: (payload: QuizBuilderPreviewPayloadDTO) => 
            courseService.previewQuizConfig(payload),
        onError: (error) => {
            const parsed = parseApiError(error);
            if (parsed.statusCode === 429) {
                toast.error('Thao tác quá nhanh!', { 
                    description: 'Hệ thống đang sinh đề, vui lòng đợi 10 giây trước khi thử lại.' 
                });
            } else {
                toast.error('Lỗi sinh đề mẫu', { description: parsed.message });
            }
        }
    });
};