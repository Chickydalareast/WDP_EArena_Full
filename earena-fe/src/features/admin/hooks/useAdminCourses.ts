import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../api/admin.service';
import { toast } from 'sonner';
import { parseApiError } from '@/shared/lib/error-parser';
import { MasterListCourseStatus, RejectCoursePayload, ForceTakedownPayload } from '../types/admin.types';

const ADMIN_COURSES_KEY = ['admin', 'courses'] as const;
const ADMIN_OVERVIEW_KEY = ['admin', 'overview'] as const;

export const useAdminCoursesMasterList = (params: {
    page: number;
    limit: number;
    search?: string;
    status?: MasterListCourseStatus;
}) => {
    return useQuery({
        queryKey: [...ADMIN_COURSES_KEY, 'master', params],
        queryFn: () => adminService.listCourses(params),
    });
};

export const useAdminCoursesList = (params: { page: number; limit: number }) => {
    return useQuery({
        queryKey: [...ADMIN_COURSES_KEY, 'pending', params],
        queryFn: () => adminService.listPendingCourses(params),
    });
};

export const useAdminCourseDetail = (id: string | null) => {
    return useQuery({
        queryKey: [...ADMIN_COURSES_KEY, 'detail', id],
        queryFn: () => adminService.getCourseDetailForReview(id as string),
        enabled: !!id,
    });
};

export const useApproveCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminService.approveCourse(id),
        onSuccess: () => {
            toast.success('Duyệt khóa học thành công!');
            queryClient.invalidateQueries({ queryKey: ADMIN_COURSES_KEY });
            queryClient.invalidateQueries({ queryKey: ADMIN_OVERVIEW_KEY });
        },
        onError: (error) => {
            toast.error('Lỗi duyệt khóa học', { description: parseApiError(error).message });
        },
    });
};

export const useRejectCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: RejectCoursePayload }) => adminService.rejectCourse(id, payload),
        onSuccess: () => {
            toast.success('Đã từ chối khóa học!');
            queryClient.invalidateQueries({ queryKey: ADMIN_COURSES_KEY });
            queryClient.invalidateQueries({ queryKey: ADMIN_OVERVIEW_KEY });
        },
        onError: (error) => {
            toast.error('Lỗi từ chối khóa học', { description: parseApiError(error).message });
        },
    });
};

export const useForceTakedownCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: ForceTakedownPayload }) => adminService.forceTakedownCourse(id, payload),
        onSuccess: () => {
            toast.success('Đã gỡ khóa học khẩn cấp!', {
                description: 'Khóa học đã bị gỡ khỏi trang chủ.'
            });
            queryClient.invalidateQueries({ queryKey: ADMIN_COURSES_KEY });
            queryClient.invalidateQueries({ queryKey: ADMIN_OVERVIEW_KEY });
        },
        onError: (error) => {
            toast.error('Gỡ khóa học thất bại', { description: parseApiError(error).message });
        },
    });
};

export const useAdminDryRunQuiz = (
    courseId: string | null,
    lessonId: string | null,
    enabled: boolean
) => {
    return useQuery({
        queryKey: [...ADMIN_COURSES_KEY, 'dry-run', courseId, lessonId],
        queryFn: () => adminService.previewDynamicQuiz(courseId as string, lessonId as string),
        enabled: !!courseId && !!lessonId && enabled,
        retry: false,
        staleTime: 0,
        gcTime: 0,
    });
};