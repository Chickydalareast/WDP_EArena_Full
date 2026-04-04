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
    // quizMatrices: (courseId: string, params?: Record<string, unknown>) =>
    //     [...courseQueryKeys.all, 'quiz-matrices', courseId, params ?? {}] as const,

    quizStats: (courseId: string, lessonId: string) =>
        [...courseQueryKeys.lessonQuizDetail(courseId, lessonId), 'stats'] as const,

    quizAttempts: (courseId: string, lessonId: string, params: { page: number; limit: number }) =>
        [...courseQueryKeys.lessonQuizDetail(courseId, lessonId), 'attempts', params] as const,

    quizMatrices: () => [...courseQueryKeys.all, 'quiz-matrices'] as const,
    quizMatricesList: (courseId: string, params: Record<string, unknown>) =>
        [...courseQueryKeys.quizMatrices(), courseId, params] as const,

    tracking: () => [...courseQueryKeys.all, 'tracking'] as const,
    trackingMembers: (courseId: string, params: Record<string, unknown>) => [...courseQueryKeys.tracking(), 'members', courseId, params] as const,
    trackingMemberExams: (courseId: string, studentId: string) => [...courseQueryKeys.tracking(), 'member-exams', courseId, studentId] as const,
    trackingMemberAttempts: (courseId: string, studentId: string, lessonId: string) => [...courseQueryKeys.tracking(), 'member-attempts', courseId, studentId, lessonId] as const,

};