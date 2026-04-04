'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLessonQuizDetail = void 0;
const react_query_1 = require("@tanstack/react-query");
const course_service_1 = require("../api/course.service");
const course_keys_1 = require("../api/course-keys");
const useLessonQuizDetail = (courseId, lessonId) => {
    return (0, react_query_1.useQuery)({
        queryKey: course_keys_1.courseQueryKeys.lessonQuizDetail(courseId, lessonId ?? ''),
        queryFn: () => course_service_1.courseService.getTeacherLessonQuizDetail(courseId, lessonId),
        enabled: !!courseId && !!lessonId,
        staleTime: 2 * 60 * 1000,
        retry: false,
    });
};
exports.useLessonQuizDetail = useLessonQuizDetail;
//# sourceMappingURL=useLessonQuizDetail.js.map