export const ROUTES = {
  PUBLIC: {
    HOME: '/',
    COURSES: '/courses',
    COURSE_DETAIL: (slug: string) => `/courses/${slug}` as const,
    PRICING: '/pricing',
    COMMUNITY: '/community',
    COMMUNITY_SUBJECT: (subjectId: string) => `/community/subject/${subjectId}` as const,
    COMMUNITY_POST: (postId: string) => `/community/post/${postId}` as const,
    COMMUNITY_PROFILE: (userId: string) => `/community/profile/${userId}` as const,
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

    STUDY_ROOM: (courseId: string, lessonId?: string) =>
      lessonId
        ? (`/student/courses/${courseId}/study?lessonId=${lessonId}` as const)
        : (`/student/courses/${courseId}/study` as const),

    EXAM_RESULT: (submissionId: string) => `/student/exams/${submissionId}/result` as const,

    HISTORY: '/student/history',
    MESSAGES: '/student/messages',
  },

  TEACHER: {
    DASHBOARD: '/teacher',
    PROFILE: '/teacher/profile',
    EXAMS: '/teacher/exams',
    CREATE_EXAM: '/teacher/exams/create',
    EXAM_BUILDER: (examId: string) => `/teacher/exams/${examId}/builder` as const,

    COURSES: '/teacher/courses',

    COURSE_DETAIL: (courseId: string) => `/teacher/courses/${courseId}` as const,
    COURSE_CURRICULUM: (courseId: string) => `/teacher/courses/${courseId}/curriculum` as const,
    COURSE_SETTINGS: (courseId: string) => `/teacher/courses/${courseId}/settings` as const,
    COURSE_BUILDER: (id: string) => `/teacher/courses/${id}/builder`,
    COURSE_MEMBERS: (courseId: string) => `/teacher/courses/${courseId}/members` as const,
    COURSE_QNA: (courseId: string) => `/teacher/courses/${courseId}/qna` as const,

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
} as const;

export const PUBLIC_PATHS = [
  ROUTES.PUBLIC.HOME,
  ROUTES.PUBLIC.PRICING,
  ...Object.values(ROUTES.AUTH),
] as string[];

export const ROLE_ROOT_PATHS = {
  STUDENT: ROUTES.STUDENT.DASHBOARD,
  TEACHER: ROUTES.TEACHER.DASHBOARD,
  ADMIN: ROUTES.ADMIN.DASHBOARD,
} as const;