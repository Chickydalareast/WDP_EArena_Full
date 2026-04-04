"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTeacherCurriculumView = exports.useReorderCurriculum = exports.useCurriculumTree = void 0;
const react_query_1 = require("@tanstack/react-query");
const course_service_1 = require("../api/course.service");
const course_keys_1 = require("../api/course-keys");
const sonner_1 = require("sonner");
const error_parser_1 = require("@/shared/lib/error-parser");
const useCurriculumTree = (courseId) => {
    return (0, react_query_1.useQuery)({
        queryKey: course_keys_1.courseQueryKeys.studyTree(courseId),
        queryFn: () => course_service_1.courseService.getStudyTree(courseId),
        staleTime: 0,
    });
};
exports.useCurriculumTree = useCurriculumTree;
const useReorderCurriculum = (courseId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    const queryKey = course_keys_1.courseQueryKeys.studyTree(courseId);
    return (0, react_query_1.useMutation)({
        mutationFn: (payload) => course_service_1.courseService.reorderCurriculum(courseId, payload),
        onMutate: async (newPayload) => {
            await queryClient.cancelQueries({ queryKey });
            const previousData = queryClient.getQueryData(queryKey);
            return { previousData };
        },
        onSuccess: () => {
            sonner_1.toast.success('Đã lưu cấu trúc khóa học mới');
        },
        onError: (err, newPayload, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(queryKey, context.previousData);
            }
            sonner_1.toast.error('Lỗi khi lưu thứ tự', { description: (0, error_parser_1.parseApiError)(err).message });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });
};
exports.useReorderCurriculum = useReorderCurriculum;
const useTeacherCurriculumView = (courseId) => {
    return (0, react_query_1.useQuery)({
        queryKey: course_keys_1.courseQueryKeys.teacherCurriculumView(courseId),
        queryFn: () => course_service_1.courseService.getCurriculumView(courseId),
        staleTime: 1000 * 60 * 5,
        enabled: !!courseId,
        select: (response) => {
            if (!response)
                return undefined;
            const raw = response;
            if ('course' in raw && 'curriculum' in raw) {
                return {
                    ...raw.course,
                    curriculum: raw.curriculum
                };
            }
            if ('sections' in raw) {
                const { sections, totalLessons, totalVideos, totalDocuments, totalQuizzes, ...courseInfo } = raw;
                return {
                    ...courseInfo,
                    curriculum: {
                        sections: sections,
                        totalLessons: totalLessons,
                        totalVideos: totalVideos,
                        totalDocuments: totalDocuments,
                        totalQuizzes: totalQuizzes
                    }
                };
            }
            return response;
        }
    });
};
exports.useTeacherCurriculumView = useTeacherCurriculumView;
//# sourceMappingURL=useCurriculumBuilder.js.map