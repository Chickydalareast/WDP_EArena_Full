'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
exports.adminService = {
    getOverview: async () => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.ADMIN.DASHBOARD_OVERVIEW);
    },
    listUsers: async (params) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.ADMIN.USERS, { params });
    },
    createUser: async (payload) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.ADMIN.USERS, payload);
    },
    updateUserRole: async (id, role) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.ADMIN.USER_ROLE(id), { role });
    },
    updateUserStatus: async (id, status) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.ADMIN.USER_STATUS(id), { status });
    },
    resetUserPassword: async (id, newPassword) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.ADMIN.USER_RESET_PASSWORD(id), { newPassword });
    },
    deactivateUser: async (id) => {
        return axios_client_1.axiosClient.delete(api_endpoints_1.API_ENDPOINTS.ADMIN.USER(id));
    },
    listExams: async (params) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.ADMIN.EXAMS, { params });
    },
    getExamPaperDetailByExamId: async (examId) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.ADMIN.EXAM_PAPER_DETAIL_BY_EXAM(examId));
    },
    setExamPublish: async (id, isPublished) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.ADMIN.EXAM_PUBLISH(id), { isPublished });
    },
    deleteExam: async (id) => {
        return axios_client_1.axiosClient.delete(`${api_endpoints_1.API_ENDPOINTS.ADMIN.EXAMS}/${id}`);
    },
    listQuestions: async (params) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.ADMIN.QUESTIONS, { params });
    },
    setQuestionArchived: async (id, isArchived) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.ADMIN.QUESTION_ARCHIVE(id), { isArchived });
    },
    deleteQuestion: async (id) => {
        return axios_client_1.axiosClient.delete(`${api_endpoints_1.API_ENDPOINTS.ADMIN.QUESTIONS}/${id}`);
    },
    listSubjects: async () => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.ADMIN.SUBJECTS);
    },
    createSubject: async (payload) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.ADMIN.SUBJECTS, payload);
    },
    updateSubject: async (id, payload) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.ADMIN.SUBJECT(id), payload);
    },
    listTopicsBySubject: async (subjectId) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.ADMIN.SUBJECT_TOPICS(subjectId));
    },
    createTopic: async (payload) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.ADMIN.TOPICS, payload);
    },
    updateTopic: async (id, payload) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.ADMIN.TOPIC(id), payload);
    },
    deleteTopic: async (id) => {
        return axios_client_1.axiosClient.delete(api_endpoints_1.API_ENDPOINTS.ADMIN.TOPIC(id));
    },
    listPricingPlans: async () => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.ADMIN.PRICING_PLANS);
    },
    createPricingPlan: async (payload) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.ADMIN.PRICING_PLANS, payload);
    },
    updatePricingPlan: async (id, payload) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.ADMIN.PRICING_PLAN(id), payload);
    },
    getBusinessMetrics: async (params) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.ADMIN.BUSINESS_METRICS, { params });
    },
    listCourses: async (params) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.ADMIN.COURSES_BASE, { params });
    },
    listPendingCourses: async (params) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.ADMIN.COURSES_PENDING, { params });
    },
    getCourseDetailForReview: async (id) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.ADMIN.COURSE_DETAIL(id));
    },
    approveCourse: async (id) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.ADMIN.COURSE_APPROVE(id), {});
    },
    rejectCourse: async (id, payload) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.ADMIN.COURSE_REJECT(id), payload);
    },
    forceTakedownCourse: async (id, payload) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.ADMIN.COURSE_FORCE_TAKEDOWN(id), payload);
    },
    listTeacherVerifications: async (params) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.ADMIN.TEACHER_VERIFICATION, { params });
    },
    updateTeacherVerification: async (id, payload) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.ADMIN.TEACHER_VERIFICATION_UPDATE(id), payload);
    },
};
//# sourceMappingURL=admin.service.js.map