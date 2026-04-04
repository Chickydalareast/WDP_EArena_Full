"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useForceTakedownCourse = exports.useRejectCourse = exports.useApproveCourse = exports.useAdminCourseDetail = exports.useAdminCoursesList = exports.useAdminCoursesMasterList = void 0;
const react_query_1 = require("@tanstack/react-query");
const admin_service_1 = require("../api/admin.service");
const sonner_1 = require("sonner");
const error_parser_1 = require("@/shared/lib/error-parser");
const ADMIN_COURSES_KEY = ['admin', 'courses'];
const ADMIN_OVERVIEW_KEY = ['admin', 'overview'];
const useAdminCoursesMasterList = (params) => {
    return (0, react_query_1.useQuery)({
        queryKey: [...ADMIN_COURSES_KEY, 'master', params],
        queryFn: () => admin_service_1.adminService.listCourses(params),
    });
};
exports.useAdminCoursesMasterList = useAdminCoursesMasterList;
const useAdminCoursesList = (params) => {
    return (0, react_query_1.useQuery)({
        queryKey: [...ADMIN_COURSES_KEY, 'pending', params],
        queryFn: () => admin_service_1.adminService.listPendingCourses(params),
    });
};
exports.useAdminCoursesList = useAdminCoursesList;
const useAdminCourseDetail = (id) => {
    return (0, react_query_1.useQuery)({
        queryKey: [...ADMIN_COURSES_KEY, 'detail', id],
        queryFn: () => admin_service_1.adminService.getCourseDetailForReview(id),
        enabled: !!id,
    });
};
exports.useAdminCourseDetail = useAdminCourseDetail;
const useApproveCourse = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (id) => admin_service_1.adminService.approveCourse(id),
        onSuccess: () => {
            sonner_1.toast.success('Duyệt khóa học thành công!');
            queryClient.invalidateQueries({ queryKey: ADMIN_COURSES_KEY });
            queryClient.invalidateQueries({ queryKey: ADMIN_OVERVIEW_KEY });
        },
        onError: (error) => {
            sonner_1.toast.error('Lỗi duyệt khóa học', { description: (0, error_parser_1.parseApiError)(error).message });
        },
    });
};
exports.useApproveCourse = useApproveCourse;
const useRejectCourse = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: ({ id, payload }) => admin_service_1.adminService.rejectCourse(id, payload),
        onSuccess: () => {
            sonner_1.toast.success('Đã từ chối khóa học!');
            queryClient.invalidateQueries({ queryKey: ADMIN_COURSES_KEY });
            queryClient.invalidateQueries({ queryKey: ADMIN_OVERVIEW_KEY });
        },
        onError: (error) => {
            sonner_1.toast.error('Lỗi từ chối khóa học', { description: (0, error_parser_1.parseApiError)(error).message });
        },
    });
};
exports.useRejectCourse = useRejectCourse;
const useForceTakedownCourse = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: ({ id, payload }) => admin_service_1.adminService.forceTakedownCourse(id, payload),
        onSuccess: () => {
            sonner_1.toast.success('Đã gỡ khóa học khẩn cấp!', {
                description: 'Khóa học đã bị gỡ khỏi trang chủ.'
            });
            queryClient.invalidateQueries({ queryKey: ADMIN_COURSES_KEY });
            queryClient.invalidateQueries({ queryKey: ADMIN_OVERVIEW_KEY });
        },
        onError: (error) => {
            sonner_1.toast.error('Gỡ khóa học thất bại', { description: (0, error_parser_1.parseApiError)(error).message });
        },
    });
};
exports.useForceTakedownCourse = useForceTakedownCourse;
//# sourceMappingURL=useAdminCourses.js.map