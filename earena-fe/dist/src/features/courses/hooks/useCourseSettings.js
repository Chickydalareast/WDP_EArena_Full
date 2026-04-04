"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDeleteCourse = exports.useCourseDashboardStats = exports.useUpdateCourse = exports.useCourseSettings = void 0;
const react_query_1 = require("@tanstack/react-query");
const course_service_1 = require("../api/course.service");
const course_keys_1 = require("../api/course-keys");
const sonner_1 = require("sonner");
const error_parser_1 = require("@/shared/lib/error-parser");
const navigation_1 = require("next/navigation");
const routes_1 = require("@/config/routes");
const useCourseSettings = (courseId) => {
    return (0, react_query_1.useQuery)({
        queryKey: course_keys_1.courseQueryKeys.teacherDetail(courseId),
        queryFn: () => course_service_1.courseService.getCourseTeacherDetail(courseId),
        staleTime: 1000 * 60 * 5,
        select: (response) => {
            const raw = response;
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
exports.useCourseSettings = useCourseSettings;
const useUpdateCourse = (courseId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (payload) => course_service_1.courseService.updateCourse(courseId, payload),
        onSuccess: () => {
            sonner_1.toast.success('Cập nhật cài đặt thành công');
            queryClient.invalidateQueries({ queryKey: course_keys_1.courseQueryKeys.teacherDetail(courseId) });
            queryClient.invalidateQueries({ queryKey: course_keys_1.courseQueryKeys.teacherCourses() });
        },
        onError: (error) => sonner_1.toast.error('Cập nhật thất bại', { description: (0, error_parser_1.parseApiError)(error).message }),
    });
};
exports.useUpdateCourse = useUpdateCourse;
const useCourseDashboardStats = (courseId) => {
    return (0, react_query_1.useQuery)({
        queryKey: course_keys_1.courseQueryKeys.teacherDashboardStats(courseId),
        queryFn: () => course_service_1.courseService.getCourseDashboardStats(courseId),
        staleTime: 1000 * 60 * 5,
    });
};
exports.useCourseDashboardStats = useCourseDashboardStats;
const useDeleteCourse = (courseId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    const router = (0, navigation_1.useRouter)();
    return (0, react_query_1.useMutation)({
        mutationFn: () => course_service_1.courseService.deleteCourse(courseId),
        onSuccess: (res) => {
            const message = res?.message || 'Khóa học đã được xử lý (Xóa hoặc Lưu trữ bảo vệ học viên).';
            sonner_1.toast.success(message);
            queryClient.invalidateQueries({ queryKey: course_keys_1.courseQueryKeys.teacherCourses() });
            router.push(routes_1.ROUTES.TEACHER.COURSES);
        },
        onError: (error) => {
            sonner_1.toast.error('Không thể thao tác', { description: (0, error_parser_1.parseApiError)(error).message });
        },
    });
};
exports.useDeleteCourse = useDeleteCourse;
//# sourceMappingURL=useCourseSettings.js.map