import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../api/course.service';
import { courseQueryKeys } from '../api/course-keys';
import { CreateCourseDTO } from '../types/course.schema';
import { toast } from 'sonner';
import { parseApiError } from '@/shared/lib/error-parser';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/config/routes';

export const useTeacherCourses = () => {
    return useQuery({
        queryKey: courseQueryKeys.teacherCourses(),
        queryFn: () => courseService.getTeacherCourses(),
        staleTime: 1000 * 60 * 2,
    });
};

export const useCreateCourse = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (payload: CreateCourseDTO) => courseService.createCourse(payload),
        onSuccess: (newCourse) => {
            toast.success('Khởi tạo khóa học thành công!', {
                description: 'Vui lòng hoàn tất cài đặt thông tin và tải lên ảnh bìa/video giới thiệu.',
            });
            
            queryClient.invalidateQueries({ queryKey: courseQueryKeys.teacherCourses() });

            router.push(ROUTES.TEACHER.COURSE_SETTINGS(newCourse.id));
        },
        onError: (error) => {
            toast.error('Lỗi khởi tạo khóa học', { description: parseApiError(error).message });
        },
    });
};