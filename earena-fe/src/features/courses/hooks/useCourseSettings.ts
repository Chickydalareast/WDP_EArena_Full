import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../api/course.service';
import { courseQueryKeys } from '../api/course-keys';
import { UpdateCourseDTO, CourseTeacherDetail, CourseDashboardStats } from '../types/course.schema';
import { toast } from 'sonner';
import { parseApiError } from '@/shared/lib/error-parser';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/config/routes';

export const useCourseSettings = (courseId: string) => {
  return useQuery({
    queryKey: courseQueryKeys.teacherDetail(courseId),
    queryFn: () => courseService.getCourseTeacherDetail(courseId),
    staleTime: 1000 * 60 * 5,
    select: (response): CourseTeacherDetail => {
      const raw = response as any;
      if (raw && raw.course && raw.curriculum) {
        return {
          ...raw.course,
          curriculum: raw.curriculum,
        };
      }
      return raw;
    }
  });
};

export const useUpdateCourse = (courseId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: UpdateCourseDTO) => courseService.updateCourse(courseId, payload),
    onSuccess: () => {
      toast.success('Cập nhật cài đặt thành công');
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.teacherDetail(courseId) });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.teacherCourses() });
    },
    onError: (error) => toast.error('Cập nhật thất bại', { description: parseApiError(error).message }),
  });
};

export const useCourseDashboardStats = (courseId: string) => {
  return useQuery({
    queryKey: courseQueryKeys.teacherDashboardStats(courseId),
    queryFn: () => courseService.getCourseDashboardStats(courseId),
    staleTime: 1000 * 60 * 5, 
  });
};

export const useDeleteCourse = (courseId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => courseService.deleteCourse(courseId),
    onSuccess: (res) => {
      // Nếu axiosClient bóc mất message, ta dùng câu fallback. Nếu sửa axiosClient rồi thì dùng res.message.
      const message = res?.message || 'Khóa học đã được xử lý (Xóa hoặc Lưu trữ bảo vệ học viên).';
      toast.success(message);
      
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.teacherCourses() });
      router.push(ROUTES.TEACHER.COURSES);
    },
    onError: (error) => {
      toast.error('Không thể thao tác', { description: parseApiError(error).message });
    },
  });
};