export const courseQueryKeys = {
    all: ['courses'] as const,

    publicLists: () => [...courseQueryKeys.all, 'public', 'list'] as const,
    publicList: (filters: Record<string, unknown>) => [...courseQueryKeys.publicLists(), filters] as const,

    publicDetails: () => [...courseQueryKeys.all, 'public', 'detail'] as const,
    publicDetail: (slug: string) => [...courseQueryKeys.publicDetails(), slug] as const,

    studyTrees: () => [...courseQueryKeys.all, 'study-tree'] as const,
    studyTree: (courseId: string) => [...courseQueryKeys.studyTrees(), courseId] as const,

    reviews: () => [...courseQueryKeys.all, 'reviews'] as const,
    reviewLists: (courseId: string) => [...courseQueryKeys.reviews(), courseId, 'list'] as const,

    wallets: () => ['wallets'] as const,
    walletBalance: () => [...courseQueryKeys.wallets(), 'me'] as const,

    teacherLists: () => [...courseQueryKeys.all, 'teacher', 'list'] as const,
    teacherDetails: () => [...courseQueryKeys.all, 'teacher', 'detail'] as const,
    teacherDetail: (courseId: string) => [...courseQueryKeys.teacherDetails(), courseId] as const,

    teacherCourses: () => [...courseQueryKeys.all, 'teacher', 'me'] as const,
    
    teacherDashboardStats: (courseId: string) => [...courseQueryKeys.teacherDetails(), courseId, 'stats'] as const,
    teacherCurriculumView: (courseId: string) => [...courseQueryKeys.teacherDetails(), courseId, 'curriculum-view'] as const,

    lessonQuizDetails: () => [...courseQueryKeys.all, 'lesson-quiz', 'detail'] as const,
    lessonQuizDetail: (courseId: string, lessonId: string) =>
        [...courseQueryKeys.lessonQuizDetails(), courseId, lessonId] as const,
    quizMatrices: (courseId: string, params?: Record<string, unknown>) =>
        [...courseQueryKeys.all, 'quiz-matrices', courseId, params ?? {}] as const,
};