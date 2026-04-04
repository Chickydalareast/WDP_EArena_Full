"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCreateCourse = exports.useTeacherCourses = void 0;
const react_query_1 = require("@tanstack/react-query");
const course_service_1 = require("../api/course.service");
const course_keys_1 = require("../api/course-keys");
const sonner_1 = require("sonner");
const error_parser_1 = require("@/shared/lib/error-parser");
const navigation_1 = require("next/navigation");
const routes_1 = require("@/config/routes");
const useTeacherCourses = () => {
    return (0, react_query_1.useQuery)({
        queryKey: course_keys_1.courseQueryKeys.teacherCourses(),
        queryFn: () => course_service_1.courseService.getTeacherCourses(),
        staleTime: 1000 * 60 * 2,
    });
};
exports.useTeacherCourses = useTeacherCourses;
const useCreateCourse = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    const router = (0, navigation_1.useRouter)();
    return (0, react_query_1.useMutation)({
        mutationFn: (payload) => course_service_1.courseService.createCourse(payload),
        onSuccess: (newCourse) => {
            sonner_1.toast.success('Khởi tạo khóa học thành công!', {
                description: 'Vui lòng hoàn tất cài đặt thông tin và tải lên ảnh bìa/video giới thiệu.',
            });
            queryClient.invalidateQueries({ queryKey: course_keys_1.courseQueryKeys.teacherCourses() });
            router.push(routes_1.ROUTES.TEACHER.COURSE_SETTINGS(newCourse.id));
        },
        onError: (error) => {
            sonner_1.toast.error('Lỗi khởi tạo khóa học', { description: (0, error_parser_1.parseApiError)(error).message });
        },
    });
};
exports.useCreateCourse = useCreateCourse;
//# sourceMappingURL=useTeacherCourses.js.map