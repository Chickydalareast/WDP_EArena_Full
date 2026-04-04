"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePublicCourseDetail = exports.usePublicCourses = void 0;
const react_query_1 = require("@tanstack/react-query");
const course_service_1 = require("../api/course.service");
const course_keys_1 = require("../api/course-keys");
const usePublicCourses = (filters = { page: 1, limit: 12 }) => {
    return (0, react_query_1.useQuery)({
        queryKey: course_keys_1.courseQueryKeys.publicList(filters),
        queryFn: () => course_service_1.courseService.getPublicCourses(filters),
        staleTime: 1000 * 60 * 5,
        select: (response) => {
            if (response?.data && response?.meta) {
                return { items: response.data, meta: response.meta };
            }
            if (response?.items && response?.meta) {
                return { items: response.items, meta: response.meta };
            }
            return {
                items: (Array.isArray(response) ? response : []),
                meta: { page: 1, limit: 12, total: 0, totalPages: 1 }
            };
        }
    });
};
exports.usePublicCourses = usePublicCourses;
const usePublicCourseDetail = (slug) => {
    return (0, react_query_1.useQuery)({
        queryKey: course_keys_1.courseQueryKeys.publicDetail(slug),
        queryFn: () => course_service_1.courseService.getPublicCourseDetail(slug),
        staleTime: 1000 * 60 * 10,
        enabled: !!slug,
        select: (response) => {
            if (!response || typeof response !== 'object')
                return undefined;
            const raw = response;
            if ('course' in raw && 'curriculum' in raw) {
                const courseData = raw.course;
                const curriculumData = raw.curriculum;
                return {
                    ...courseData,
                    teacher: courseData.teacher,
                    isEnrolled: raw.isEnrolled,
                    curriculum: {
                        ...curriculumData,
                        sections: Array.isArray(curriculumData.sections)
                            ? curriculumData.sections
                            : []
                    }
                };
            }
            if ('id' in raw && 'title' in raw && 'curriculum' in raw) {
                return raw;
            }
            return undefined;
        }
    });
};
exports.usePublicCourseDetail = usePublicCourseDetail;
//# sourceMappingURL=useCourses.js.map