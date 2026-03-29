import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../api/course.service';
import { courseQueryKeys } from '../api/course-keys';
import { ReorderCurriculumPayload } from '../types/course.schema';
import { toast } from 'sonner';
import { parseApiError } from '@/shared/lib/error-parser';

export const useCurriculumTree = (courseId: string) => {
  return useQuery({
    queryKey: courseQueryKeys.studyTree(courseId),
    queryFn: () => courseService.getStudyTree(courseId),
    staleTime: 0,
  });
};

export const useReorderCurriculum = (courseId: string) => {
  const queryClient = useQueryClient();
  const queryKey = courseQueryKeys.studyTree(courseId);

  return useMutation({
    mutationFn: (payload: ReorderCurriculumPayload) => 
      courseService.reorderCurriculum(courseId, payload),
    
    onMutate: async (newPayload) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      return { previousData };
    },

    onSuccess: () => {
      toast.success('Đã lưu cấu trúc khóa học mới');
    },

    onError: (err, newPayload, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error('Lỗi khi lưu thứ tự', { description: parseApiError(err).message });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};