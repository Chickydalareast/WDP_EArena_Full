import { useQuery } from '@tanstack/react-query';
import { adminService } from '../api/admin.service';

export const ADMIN_EXAMS_KEY = ['admin', 'exams'] as const;

export const useAdminPaperDetailByExam = (examId: string | null) => {
    return useQuery({
        queryKey: [...ADMIN_EXAMS_KEY, 'paper-by-exam', examId],
        queryFn: async () => {
            if (!examId) throw new Error('Missing examId');
            return adminService.getExamPaperDetailByExamId(examId);
        },
        enabled: !!examId,
        staleTime: 0, 
    });
};