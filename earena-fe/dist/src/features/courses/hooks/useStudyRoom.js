"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRefreshLessonToken = exports.useMarkLessonCompleted = exports.useLessonContent = exports.useStudyTree = void 0;
const react_query_1 = require("@tanstack/react-query");
const course_service_1 = require("../api/course.service");
const course_keys_1 = require("../api/course-keys");
const sonner_1 = require("sonner");
const error_parser_1 = require("@/shared/lib/error-parser");
const useStudyTree = (courseId) => {
    return (0, react_query_1.useQuery)({
        queryKey: course_keys_1.courseQueryKeys.studyTree(courseId),
        queryFn: () => course_service_1.courseService.getStudyTree(courseId),
        staleTime: 1000 * 60 * 5,
        enabled: !!courseId,
    });
};
exports.useStudyTree = useStudyTree;
const useLessonContent = (courseId, lessonId) => {
    return (0, react_query_1.useQuery)({
        queryKey: [...course_keys_1.courseQueryKeys.studyTree(courseId), 'lesson', lessonId],
        queryFn: async () => {
            if (!lessonId)
                throw new Error('Lesson ID is missing');
            return course_service_1.courseService.getLessonContent(courseId, lessonId);
        },
        staleTime: 1000 * 60 * 10,
        enabled: !!courseId && !!lessonId,
    });
};
exports.useLessonContent = useLessonContent;
const useMarkLessonCompleted = (courseId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    const treeKey = course_keys_1.courseQueryKeys.studyTree(courseId);
    return (0, react_query_1.useMutation)({
        mutationFn: (lessonId) => course_service_1.courseService.markLessonCompleted({ courseId, lessonId }),
        onMutate: async (lessonId) => {
            await queryClient.cancelQueries({ queryKey: treeKey });
            const previousTree = queryClient.getQueryData(treeKey);
            if (previousTree) {
                queryClient.setQueryData(treeKey, (oldData) => {
                    if (!oldData)
                        return oldData;
                    const newSections = oldData.curriculum.sections.map(section => ({
                        ...section,
                        lessons: section.lessons.map(lesson => lesson.id === lessonId ? { ...lesson, isCompleted: true } : lesson)
                    }));
                    const allLessons = newSections.flatMap(s => s.lessons);
                    const totalLessons = allLessons.length;
                    const completedLessons = allLessons.filter(l => l.isCompleted).length;
                    const newProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
                    return {
                        ...oldData,
                        progress: newProgress,
                        curriculum: {
                            ...oldData.curriculum,
                            sections: newSections
                        }
                    };
                });
            }
            return { previousTree };
        },
        onError: (err, lessonId, context) => {
            if (context?.previousTree) {
                queryClient.setQueryData(treeKey, context.previousTree);
            }
            sonner_1.toast.error('Không thể lưu tiến độ', { description: (0, error_parser_1.parseApiError)(err).message });
        }
    });
};
exports.useMarkLessonCompleted = useMarkLessonCompleted;
const useRefreshLessonToken = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return {
        refreshToken: async (courseId, lessonId) => {
            await queryClient.invalidateQueries({
                queryKey: [...course_keys_1.courseQueryKeys.studyTree(courseId), 'lesson', lessonId]
            });
        }
    };
};
exports.useRefreshLessonToken = useRefreshLessonToken;
//# sourceMappingURL=useStudyRoom.js.map