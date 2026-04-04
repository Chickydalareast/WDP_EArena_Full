'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCourseTeacherDetail = void 0;
const react_query_1 = require("@tanstack/react-query");
const course_service_1 = require("../api/course.service");
const course_keys_1 = require("../api/course-keys");
const useCourseTeacherDetail = (courseId) => {
    return (0, react_query_1.useQuery)({
        queryKey: course_keys_1.courseQueryKeys.teacherDetail(courseId),
        queryFn: () => course_service_1.courseService.getCourseTeacherDetail(courseId),
        enabled: !!courseId,
        staleTime: 5 * 60 * 1000,
    });
};
exports.useCourseTeacherDetail = useCourseTeacherDetail;
//# sourceMappingURL=useCourseTeacherDetail.js.map