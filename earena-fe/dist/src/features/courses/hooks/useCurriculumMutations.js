"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUpdateQuizLesson = exports.useCreateQuizLesson = exports.useSubmitForReview = exports.usePublishCourse = exports.useGenerateAiCurriculum = exports.useDeleteLesson = exports.useDeleteSection = exports.useUpdateLesson = exports.useUpdateSection = exports.useCreateLesson = exports.useCreateSection = void 0;
const react_query_1 = require("@tanstack/react-query");
const course_service_1 = require("../api/course.service");
const course_keys_1 = require("../api/course-keys");
const sonner_1 = require("sonner");
const error_parser_1 = require("@/shared/lib/error-parser");
const navigation_1 = require("next/navigation");
const routes_1 = require("@/config/routes");
const upgrade_ui_store_1 = require("@/features/billing/stores/upgrade-ui.store");
const invalidateCurriculumCache = (queryClient, courseId) => {
    queryClient.invalidateQueries({ queryKey: course_keys_1.courseQueryKeys.studyTree(courseId) });
    queryClient.invalidateQueries({ queryKey: course_keys_1.courseQueryKeys.teacherDetail(courseId) });
};
const useCreateSection = (courseId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (payload) => course_service_1.courseService.createSection(courseId, payload),
        onSuccess: () => {
            sonner_1.toast.success('Đã tạo chương học mới');
            invalidateCurriculumCache(queryClient, courseId);
        },
        onError: (error) => sonner_1.toast.error('Lỗi tạo chương', { description: (0, error_parser_1.parseApiError)(error).message }),
    });
};
exports.useCreateSection = useCreateSection;
const useCreateLesson = (courseId, sectionId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (payload) => course_service_1.courseService.createLesson(courseId, sectionId, payload),
        onSuccess: () => {
            sonner_1.toast.success('Đã thêm bài học mới');
            invalidateCurriculumCache(queryClient, courseId);
        },
        onError: (error) => sonner_1.toast.error('Lỗi thêm bài học', { description: (0, error_parser_1.parseApiError)(error).message }),
    });
};
exports.useCreateLesson = useCreateLesson;
const useUpdateSection = (courseId, sectionId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (payload) => course_service_1.courseService.updateSection(courseId, sectionId, payload),
        onSuccess: () => {
            sonner_1.toast.success('Cập nhật chương thành công');
            invalidateCurriculumCache(queryClient, courseId);
        },
        onError: (error) => sonner_1.toast.error('Lỗi cập nhật chương', { description: (0, error_parser_1.parseApiError)(error).message }),
    });
};
exports.useUpdateSection = useUpdateSection;
const useUpdateLesson = (courseId, lessonId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (payload) => course_service_1.courseService.updateLesson(courseId, lessonId, payload),
        onSuccess: () => {
            sonner_1.toast.success('Cập nhật bài học thành công');
            invalidateCurriculumCache(queryClient, courseId);
        },
        onError: (error) => sonner_1.toast.error('Lỗi cập nhật bài học', { description: (0, error_parser_1.parseApiError)(error).message }),
    });
};
exports.useUpdateLesson = useUpdateLesson;
const useDeleteSection = (courseId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (sectionId) => course_service_1.courseService.deleteSection(courseId, sectionId),
        onSuccess: () => {
            sonner_1.toast.success('Đã xóa chương học');
            invalidateCurriculumCache(queryClient, courseId);
        },
        onError: (error) => sonner_1.toast.error('Lỗi xóa chương', { description: (0, error_parser_1.parseApiError)(error).message }),
    });
};
exports.useDeleteSection = useDeleteSection;
const useDeleteLesson = (courseId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (lessonId) => course_service_1.courseService.deleteLesson(courseId, lessonId),
        onSuccess: () => {
            sonner_1.toast.success('Đã xóa bài học');
            invalidateCurriculumCache(queryClient, courseId);
        },
        onError: (error) => sonner_1.toast.error('Lỗi xóa bài học', { description: (0, error_parser_1.parseApiError)(error).message }),
    });
};
exports.useDeleteLesson = useDeleteLesson;
const useGenerateAiCurriculum = (courseId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (payload) => course_service_1.courseService.generateAiCurriculum(courseId, payload),
        onSuccess: (data) => {
            sonner_1.toast.success('AI hoàn tất phân tích!', {
                description: data.message || `Đã tự động khởi tạo ${data.sectionsGenerated} chương bài giảng.`,
                duration: 6000,
            });
            invalidateCurriculumCache(queryClient, courseId);
        },
        onError: (error) => {
            const parsedError = (0, error_parser_1.parseApiError)(error);
            const isTimeout = parsedError.statusCode === 408 || error?.toString().includes('timeout');
            sonner_1.toast.error(isTimeout ? 'AI đang quá tải (Timeout)' : 'Lỗi khởi tạo giáo án', {
                description: isTimeout
                    ? 'Tài liệu của bạn quá dài hoặc hệ thống LLM đang chậm. Vui lòng thử lại sau.'
                    : parsedError.message,
                duration: 8000,
            });
        },
    });
};
exports.useGenerateAiCurriculum = useGenerateAiCurriculum;
const usePublishCourse = (courseId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    const router = (0, navigation_1.useRouter)();
    return (0, react_query_1.useMutation)({
        mutationFn: () => course_service_1.courseService.publishCourse(courseId),
        onSuccess: () => {
            sonner_1.toast.success('Xuất bản khóa học thành công!');
            invalidateCurriculumCache(queryClient, courseId);
            router.push(routes_1.ROUTES.TEACHER.COURSES);
        },
        onError: (error) => {
            const parsed = (0, error_parser_1.parseApiError)(error);
            if (parsed.statusCode === 403) {
                upgrade_ui_store_1.useUpgradeUIStore.getState().openModal(parsed.message);
                return;
            }
            if (parsed.statusCode === 400) {
                sonner_1.toast.error('Không đủ điều kiện xuất bản', {
                    description: parsed.message || 'Vui lòng kiểm tra lại cấu trúc: Cần ít nhất 1 bài học và đã thiết lập giá tiền.',
                    duration: 6000,
                });
            }
            else {
                sonner_1.toast.error('Lỗi xuất bản', { description: parsed.message });
            }
        },
    });
};
exports.usePublishCourse = usePublishCourse;
const useSubmitForReview = (courseId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    const router = (0, navigation_1.useRouter)();
    return (0, react_query_1.useMutation)({
        mutationFn: () => course_service_1.courseService.submitForReview(courseId),
        onSuccess: () => {
            sonner_1.toast.success('Đã gửi yêu cầu kiểm duyệt!', {
                description: 'Hệ thống sẽ xem xét và phản hồi trong thời gian sớm nhất.',
            });
            queryClient.invalidateQueries({ queryKey: course_keys_1.courseQueryKeys.teacherDetail(courseId) });
            queryClient.invalidateQueries({ queryKey: course_keys_1.courseQueryKeys.teacherCourses() });
            router.push(routes_1.ROUTES.TEACHER.COURSES);
        },
        onError: (error) => {
            const parsed = (0, error_parser_1.parseApiError)(error);
            if (parsed.statusCode === 403) {
                upgrade_ui_store_1.useUpgradeUIStore.getState().openModal(parsed.message);
                return;
            }
            if (parsed.statusCode === 400) {
                sonner_1.toast.error('Không đủ điều kiện gửi duyệt', {
                    description: parsed.message || 'Vui lòng kiểm tra lại: Cần ít nhất 1 bài học và đã thiết lập giá tiền.',
                    duration: 6000,
                });
            }
            else {
                sonner_1.toast.error('Lỗi hệ thống', { description: parsed.message });
            }
        },
    });
};
exports.useSubmitForReview = useSubmitForReview;
const useCreateQuizLesson = (courseId, sectionId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (formData) => course_service_1.courseService.createQuizLesson({
            ...formData,
            courseId,
            sectionId,
        }),
        onSuccess: () => {
            sonner_1.toast.success('Đã tạo bài kiểm tra động mới');
            invalidateCurriculumCache(queryClient, courseId);
        },
        onError: (error) => {
            const parsed = (0, error_parser_1.parseApiError)(error);
            if (parsed.statusCode === 409 || parsed.message?.includes('11000')) {
                sonner_1.toast.error('Lỗi tạo bài học', {
                    description: 'Hệ thống đang xử lý thứ tự bài học. Vui lòng thử lại sau 1-2 giây.',
                    duration: 5000,
                });
                return;
            }
            sonner_1.toast.error('Lỗi tạo bài kiểm tra', { description: parsed.message });
        },
    });
};
exports.useCreateQuizLesson = useCreateQuizLesson;
const useUpdateQuizLesson = (courseId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (payload) => course_service_1.courseService.updateQuizLesson(payload),
        onSuccess: (_data, variables) => {
            sonner_1.toast.success('Cập nhật bài kiểm tra thành công');
            invalidateCurriculumCache(queryClient, courseId);
            if (variables.lessonId) {
                queryClient.invalidateQueries({
                    queryKey: course_keys_1.courseQueryKeys.lessonQuizDetail(courseId, variables.lessonId),
                });
            }
        },
        onError: (error) => {
            const parsed = (0, error_parser_1.parseApiError)(error);
            if (parsed.statusCode === 409) {
                throw error;
            }
            sonner_1.toast.error('Lỗi cập nhật bài kiểm tra', { description: parsed.message });
        },
    });
};
exports.useUpdateQuizLesson = useUpdateQuizLesson;
//# sourceMappingURL=useCurriculumMutations.js.map