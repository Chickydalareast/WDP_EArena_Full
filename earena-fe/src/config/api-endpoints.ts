export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  CLASSES: {
    BASE: '/classes', 
    SEARCH: '/classes/search', 
    PREVIEW: (classId: string) => `/classes/${classId}/preview` as const, 
    JOIN_BY_CODE: '/classes/join-by-code', 
    REQUEST_JOIN: (classId: string) => `/classes/${classId}/request-join` as const, 
    MEMBERS: (classId: string) => `/classes/${classId}/members` as const,
    REVIEW_MEMBER: (classId: string) => `/classes/${classId}/review-member` as const,
    CLASS_DETAIL: (classId: string) => `/teacher/classes/${classId}` as const
  },

  EXAMS: {
    BASE: '/exams',
    DETAIL: (examId: string) => `/exams/${examId}` as const,
    PAPER: (examId: string) => `/exams/${examId}/paper` as const,
  }
} as const;