"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useQuizHealth = exports.useLessonQuizDetail = void 0;
const react_query_1 = require("@tanstack/react-query");
const course_service_1 = require("../api/course.service");
const course_keys_1 = require("../api/course-keys");
const useLessonQuizDetail = (courseId, lessonId) => {
    return (0, react_query_1.useQuery)({
        queryKey: course_keys_1.courseQueryKeys.lessonQuizDetail(courseId, lessonId),
        queryFn: () => course_service_1.courseService.getTeacherLessonQuizDetail(courseId, lessonId),
        enabled: !!courseId && !!lessonId,
        staleTime: 0,
    });
};
exports.useLessonQuizDetail = useLessonQuizDetail;
const useQuizHealth = (lessonId) => {
    return (0, react_query_1.useQuery)({
        queryKey: ['quiz-health', lessonId],
        queryFn: async () => {
            const response = await course_service_1.courseService.getQuizHealth(lessonId);
            return response.data || response;
        },
        enabled: !!lessonId,
        staleTime: 0,
    });
};
exports.useQuizHealth = useQuizHealth;
//# sourceMappingURL=useQuizQueries.js.map