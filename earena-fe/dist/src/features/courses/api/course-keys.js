"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseQueryKeys = void 0;
exports.courseQueryKeys = {
    all: ['courses'],
    publicLists: () => [...exports.courseQueryKeys.all, 'public', 'list'],
    publicList: (filters) => [...exports.courseQueryKeys.publicLists(), filters],
    publicDetails: () => [...exports.courseQueryKeys.all, 'public', 'detail'],
    publicDetail: (slug) => [...exports.courseQueryKeys.publicDetails(), slug],
    featuredCarousel: () => [...exports.courseQueryKeys.all, 'public', 'featured-carousel'],
    studyTrees: () => [...exports.courseQueryKeys.all, 'study-tree'],
    studyTree: (courseId) => [...exports.courseQueryKeys.studyTrees(), courseId],
    reviews: () => [...exports.courseQueryKeys.all, 'reviews'],
    reviewLists: (courseId) => [...exports.courseQueryKeys.reviews(), courseId, 'list'],
    wallets: () => ['wallets'],
    walletBalance: () => [...exports.courseQueryKeys.wallets(), 'me'],
    teacherLists: () => [...exports.courseQueryKeys.all, 'teacher', 'list'],
    teacherDetails: () => [...exports.courseQueryKeys.all, 'teacher', 'detail'],
    teacherDetail: (courseId) => [...exports.courseQueryKeys.teacherDetails(), courseId],
    teacherCourses: () => [...exports.courseQueryKeys.all, 'teacher', 'me'],
    teacherDashboardStats: (courseId) => [...exports.courseQueryKeys.teacherDetails(), courseId, 'stats'],
    teacherCurriculumView: (courseId) => [...exports.courseQueryKeys.teacherDetails(), courseId, 'curriculum-view'],
    lessonQuizDetails: () => [...exports.courseQueryKeys.all, 'lesson-quiz', 'detail'],
    lessonQuizDetail: (courseId, lessonId) => [...exports.courseQueryKeys.lessonQuizDetails(), courseId, lessonId],
    quizMatrices: (courseId, params) => [...exports.courseQueryKeys.all, 'quiz-matrices', courseId, params ?? {}],
};
//# sourceMappingURL=course-keys.js.map