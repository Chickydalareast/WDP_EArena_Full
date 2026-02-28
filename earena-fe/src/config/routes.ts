export const ROUTES = {
  PUBLIC: {
    HOME: '/',
  },
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
  },
  STUDENT: {
    DASHBOARD: '/student',
    EXAMS: '/student/exams',
    TAKE_EXAM: (examId: string) => `/student/exams/${examId}/take` as const,
  },
  TEACHER: {
    DASHBOARD: '/teacher',
    EXAMS: '/teacher/exams',
    CREATE_EXAM: '/teacher/exams/create',
    EXAM_BUILDER: (examId: string) => `/teacher/exams/${examId}/builder` as const,
    CLASS_DETAIL: (classId: string) => `/teacher/classes/${classId}` as const,
  },
} as const;


export const PUBLIC_ROUTES = [
  ROUTES.PUBLIC.HOME,
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.REGISTER,
  ROUTES.AUTH.FORGOT_PASSWORD,
];


export const ROLE_ROOT_PATHS = {
  STUDENT: ROUTES.STUDENT.DASHBOARD,
  TEACHER: ROUTES.TEACHER.DASHBOARD,
  ADMIN: '/admin', 
} as const;