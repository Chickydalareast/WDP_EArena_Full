"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseService = void 0;
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
exports.courseService = {
    getPublicCourses: async (params) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COURSES.PUBLIC, { params });
    },
    getPublicCourseDetail: async (slug) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COURSES.PUBLIC_DETAIL(slug));
    },
    getFeaturedCarousel: async () => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COURSES.PUBLIC_FEATURED_CAROUSEL);
    },
    promoteCourse: async (courseId, durationDays) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.COURSES.PROMOTE(courseId), {
            durationDays,
        });
    },
    getStudyTree: async (courseId) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COURSES.STUDY_TREE(courseId));
    },
    getLessonContent: async (courseId, lessonId) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COURSES.LESSON_CONTENT(courseId, lessonId));
    },
    markLessonCompleted: async (payload) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.ENROLLMENTS.MARK_COMPLETED, payload);
    },
    enrollCourse: async (courseId) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.ENROLLMENTS.ENROLL(courseId));
    },
    getTeacherCourses: async () => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COURSES.TEACHER_COURSES);
    },
    getCourseTeacherDetail: async (courseId) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COURSES.TEACHER_DETAIL(courseId));
    },
    createCourse: async (payload) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.COURSES.BASE, payload);
    },
    updateCourse: async (courseId, payload) => {
        return axios_client_1.axiosClient.put(api_endpoints_1.API_ENDPOINTS.COURSES.DETAIL(courseId), payload);
    },
    submitForReview: async (courseId) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.COURSES.SUBMIT_REVIEW(courseId));
    },
    publishCourse: async (courseId) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.COURSES.PUBLISH(courseId));
    },
    reorderCurriculum: async (courseId, payload) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.COURSES.REORDER(courseId), payload);
    },
    createSection: async (courseId, payload) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.COURSES.SECTIONS(courseId), payload);
    },
    updateSection: async (courseId, sectionId, payload) => {
        return axios_client_1.axiosClient.put(`${api_endpoints_1.API_ENDPOINTS.COURSES.SECTIONS(courseId)}/${sectionId}`, payload);
    },
    deleteSection: async (courseId, sectionId) => {
        return axios_client_1.axiosClient.delete(`${api_endpoints_1.API_ENDPOINTS.COURSES.SECTIONS(courseId)}/${sectionId}`);
    },
    createLesson: async (courseId, sectionId, payload) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.COURSES.LESSONS(courseId, sectionId), payload);
    },
    updateLesson: async (courseId, lessonId, payload) => {
        return axios_client_1.axiosClient.put(`${api_endpoints_1.API_ENDPOINTS.COURSES.BASE}/${courseId}/lessons/${lessonId}`, payload);
    },
    deleteLesson: async (courseId, lessonId) => {
        return axios_client_1.axiosClient.delete(`${api_endpoints_1.API_ENDPOINTS.COURSES.BASE}/${courseId}/lessons/${lessonId}`);
    },
    generateAiCurriculum: async (courseId, payload) => {
        const formData = new FormData();
        payload.files.forEach((file) => {
            formData.append('files', file);
        });
        if (payload.targetSectionCount !== undefined) {
            formData.append('targetSectionCount', payload.targetSectionCount.toString());
        }
        if (payload.additionalInstructions?.trim()) {
            formData.append('additionalInstructions', payload.additionalInstructions.trim());
        }
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.COURSES.AI_GENERATE(courseId), formData, {
            timeout: 60000,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    sendHeartbeat: async (payload) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.LEARNING.HEARTBEAT, payload);
    },
    getCourseDashboardStats: async (courseId) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COURSES.TEACHER_DASHBOARD_STATS(courseId));
    },
    getCurriculumView: async (courseId) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COURSES.TEACHER_CURRICULUM_VIEW(courseId));
    },
    deleteCourse: async (courseId) => {
        return axios_client_1.axiosClient.delete(api_endpoints_1.API_ENDPOINTS.COURSES.DETAIL(courseId));
    },
    getTeacherLessonQuizDetail: async (courseId, lessonId) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COURSES.LESSON_DETAIL(courseId, lessonId));
    },
    previewQuizRule: async (payload) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.COURSES.QUIZ_BUILDER_RULE_PREVIEW, payload);
    },
    previewQuizConfig: async (payload) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.COURSES.QUIZ_BUILDER_PREVIEW, payload, { timeout: 20000 });
    },
    getQuizMatrices: async (params) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COURSES.QUIZ_BUILDER_MATRICES, { params });
    },
    createQuizLesson: async (payload) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.COURSES.QUIZ_BUILDER, payload);
    },
    updateQuizLesson: async (payload) => {
        return axios_client_1.axiosClient.put(api_endpoints_1.API_ENDPOINTS.COURSES.QUIZ_BUILDER, payload);
    },
    deleteQuizLesson: async (courseId, lessonId) => {
        return axios_client_1.axiosClient.delete(api_endpoints_1.API_ENDPOINTS.COURSES.QUIZ_BUILDER, { params: { courseId, lessonId } });
    },
    getQuizHealth: async (lessonId) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COURSES.QUIZ_BUILDER_HEALTH(lessonId));
    },
};
//# sourceMappingURL=course.service.js.map