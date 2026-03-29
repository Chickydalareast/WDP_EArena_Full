import { useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../api/course.service';
import { courseQueryKeys } from '../api/course-keys';
import { toast } from 'sonner';
import { parseApiError } from '@/shared/lib/error-parser';
import { CreateSectionDTO, CreateLessonDTO, UpdateSectionDTO, UpdateLessonDTO, AiBuilderFormDTO } from '../types/curriculum.schema';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/config/routes';
import { useUpgradeUIStore } from '@/features/billing/stores/upgrade-ui.store';

const invalidateCurriculumCache = (queryClient: any, courseId: string) => {
  queryClient.invalidateQueries({ queryKey: courseQueryKeys.studyTree(courseId) });
  queryClient.invalidateQueries({ queryKey: courseQueryKeys.teacherDetail(courseId) });
};

export const useCreateSection = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSectionDTO) => courseService.createSection(courseId, payload),
    onSuccess: () => {
      toast.success('Đã tạo chương học mới');
      invalidateCurriculumCache(queryClient, courseId);
    },
    onError: (error) => toast.error('Lỗi tạo chương', { description: parseApiError(error).message }),
  });
};

export const useCreateLesson = (courseId: string, sectionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLessonDTO) => courseService.createLesson(courseId, sectionId, payload),
    onSuccess: () => {
      toast.success('Đã thêm bài học mới');
      invalidateCurriculumCache(queryClient, courseId);
    },
    onError: (error) => toast.error('Lỗi thêm bài học', { description: parseApiError(error).message }),
  });
};

export const useUpdateSection = (courseId: string, sectionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSectionDTO) => courseService.updateSection(courseId, sectionId, payload),
    onSuccess: () => {
      toast.success('Cập nhật chương thành công');
      invalidateCurriculumCache(queryClient, courseId);
    },
    onError: (error) => toast.error('Lỗi cập nhật chương', { description: parseApiError(error).message }),
  });
};

export const useUpdateLesson = (courseId: string, lessonId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateLessonDTO) => courseService.updateLesson(courseId, lessonId, payload),
    onSuccess: () => {
      toast.success('Cập nhật bài học thành công');
      invalidateCurriculumCache(queryClient, courseId);
    },
    onError: (error) => toast.error('Lỗi cập nhật bài học', { description: parseApiError(error).message }),
  });
};

export const useDeleteSection = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sectionId: string) => courseService.deleteSection(courseId, sectionId),
    onSuccess: () => {
      toast.success('Đã xóa chương học');
      invalidateCurriculumCache(queryClient, courseId);
    },
    onError: (error) => toast.error('Lỗi xóa chương', { description: parseApiError(error).message }),
  });
};

export const useDeleteLesson = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) => courseService.deleteLesson(courseId, lessonId),
    onSuccess: () => {
      toast.success('Đã xóa bài học');
      invalidateCurriculumCache(queryClient, courseId);
    },
    onError: (error) => toast.error('Lỗi xóa bài học', { description: parseApiError(error).message }),
  });
};

export const useGenerateAiCurriculum = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AiBuilderFormDTO) => courseService.generateAiCurriculum(courseId, payload),

    onSuccess: (data) => {
      toast.success('AI hoàn tất phân tích!', {
        description: data.message || `Đã tự động khởi tạo ${data.sectionsGenerated} chương bài giảng.`,
        duration: 6000,
      });

      invalidateCurriculumCache(queryClient, courseId);
    },

    onError: (error: unknown) => {
      const parsedError = parseApiError(error);

      const isTimeout = parsedError.statusCode === 408 || error?.toString().includes('timeout');

      toast.error(isTimeout ? 'AI đang quá tải (Timeout)' : 'Lỗi khởi tạo giáo án', {
        description: isTimeout
          ? 'Tài liệu của bạn quá dài hoặc hệ thống LLM đang chậm. Vui lòng thử lại sau.'
          : parsedError.message,
        duration: 8000,
      });
    },
  });
};


export const usePublishCourse = (courseId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => courseService.publishCourse(courseId),
    onSuccess: () => {
      toast.success('Xuất bản khóa học thành công!');
      invalidateCurriculumCache(queryClient, courseId);
      router.push(ROUTES.TEACHER.COURSES);
    },
    onError: (error) => {
      const parsed = parseApiError(error);
      
      if (parsed.statusCode === 403) {
        useUpgradeUIStore.getState().openModal(parsed.message);
        return;
      }

      if (parsed.statusCode === 400) {
        toast.error('Không đủ điều kiện xuất bản', {
          description: parsed.message || 'Vui lòng kiểm tra lại cấu trúc: Cần ít nhất 1 bài học và đã thiết lập giá tiền.',
          duration: 6000,
        });
      } else {
        toast.error('Lỗi xuất bản', { description: parsed.message });
      }
    },
  });
};

export const useSubmitForReview = (courseId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => courseService.submitForReview(courseId),
    onSuccess: () => {
      toast.success('Đã gửi yêu cầu kiểm duyệt!', {
        description: 'Hệ thống sẽ xem xét và phản hồi trong thời gian sớm nhất.',
      });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.teacherDetail(courseId) });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.teacherCourses() });
      
      router.push(ROUTES.TEACHER.COURSES);
    },
    onError: (error) => {
      const parsed = parseApiError(error);
      
      if (parsed.statusCode === 403) {
        useUpgradeUIStore.getState().openModal(parsed.message);
        return;
      }

      if (parsed.statusCode === 400) {
        toast.error('Không đủ điều kiện gửi duyệt', {
          description: parsed.message || 'Vui lòng kiểm tra lại: Cần ít nhất 1 bài học và đã thiết lập giá tiền.',
          duration: 6000,
        });
      } else {
        toast.error('Lỗi hệ thống', { description: parsed.message });
      }
    },
  });
};