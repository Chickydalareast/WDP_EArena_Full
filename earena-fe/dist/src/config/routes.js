"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_ROOT_PATHS = exports.PUBLIC_PATHS = exports.ROUTES = void 0;
exports.ROUTES = {
    PUBLIC: {
        HOME: '/',
        COURSES: '/courses',
        COURSE_DETAIL: (slug) => `/courses/${slug}`,
        PRICING: '/pricing',
        COMMUNITY: '/community',
        COMMUNITY_SUBJECT: (subjectId) => `/community/subject/${subjectId}`,
        COMMUNITY_POST: (postId) => `/community/post/${postId}`,
        COMMUNITY_PROFILE: (userId) => `/community/profile/${userId}`,
    },
    AUTH: {
        LOGIN: '/login',
        REGISTER: '/register',
        FORGOT_PASSWORD: '/forgot-password',
        WAITING_APPROVAL: '/waiting-approval',
    },
    STUDENT: {
        DASHBOARD: '/student',
        PROFILE: '/student/profile',
        MY_COURSES: '/student/courses',
        WALLET: '/student/wallet',
        STUDY_ROOM: (courseId, lessonId) => lessonId
            ? `/student/courses/${courseId}/study?lessonId=${lessonId}`
            : `/student/courses/${courseId}/study`,
        EXAM_RESULT: (submissionId) => `/student/exams/${submissionId}/result`,
        HISTORY: '/student/history',
        MESSAGES: '/student/messages',
    },
    TEACHER: {
        DASHBOARD: '/teacher',
        PROFILE: '/teacher/profile',
        EXAMS: '/teacher/exams',
        CREATE_EXAM: '/teacher/exams/create',
        EXAM_BUILDER: (examId) => `/teacher/exams/${examId}/builder`,
        COURSES: '/teacher/courses',
        COURSE_DETAIL: (courseId) => `/teacher/courses/${courseId}`,
        COURSE_CURRICULUM: (courseId) => `/teacher/courses/${courseId}/curriculum`,
        COURSE_SETTINGS: (courseId) => `/teacher/courses/${courseId}/settings`,
        COURSE_BUILDER: (id) => `/teacher/courses/${id}/builder`,
        QUESTIONS: '/teacher/questions',
        WALLET: '/teacher/wallet',
        SUBSCRIPTION: '/teacher/subscription',
        MESSAGES: '/teacher/messages',
    },
    ADMIN: {
        DASHBOARD: '/admin',
        BUSINESS: '/admin/business',
        TEACHERS: '/admin/teachers',
        USERS: '/admin/users',
        EXAMS: '/admin/exams',
        COURSES: '/admin/courses',
        QUESTIONS: '/admin/questions',
        TAXONOMY: '/admin/taxonomy',
        PRICING: '/admin/pricing',
        VERIFICATION: '/admin/teachers/verification',
        WITHDRAWALS: '/admin/withdrawals',
    },
};
exports.PUBLIC_PATHS = [
    exports.ROUTES.PUBLIC.HOME,
    exports.ROUTES.PUBLIC.PRICING,
    ...Object.values(exports.ROUTES.AUTH),
];
exports.ROLE_ROOT_PATHS = {
    STUDENT: exports.ROUTES.STUDENT.DASHBOARD,
    TEACHER: exports.ROUTES.TEACHER.DASHBOARD,
    ADMIN: exports.ROUTES.ADMIN.DASHBOARD,
};
//# sourceMappingURL=routes.js.map