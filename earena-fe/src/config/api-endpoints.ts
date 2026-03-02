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
<<<<<<< HEAD
    BASE: '/classes', 
    SEARCH: '/classes/search', 
    PREVIEW: (classId: string) => `/classes/${classId}/preview` as const, 
    JOIN_BY_CODE: '/classes/join-by-code', 
    REQUEST_JOIN: (classId: string) => `/classes/${classId}/request-join` as const, 
    MEMBERS: (classId: string) => `/classes/${classId}/members` as const,
    REVIEW_MEMBER: (classId: string) => `/classes/${classId}/review-member` as const,
    CLASS_DETAIL: (classId: string) => `/teacher/classes/${classId}` as const
=======
    BASE: '/classes',
    SEARCH: '/classes/search',
    PREVIEW: (classId: string) => `/classes/${classId}/preview` as const,
    JOIN_BY_CODE: '/classes/join-by-code',
    REQUEST_JOIN: (classId: string) => `/classes/${classId}/request-join` as const,
    MEMBERS: (classId: string) => `/classes/${classId}/members` as const,
    REVIEW_MEMBER: (classId: string) => `/classes/${classId}/review-member` as const,
    CLASS_DETAIL: (classId: string) => `/teacher/classes/${classId}` as const,
>>>>>>> feature/admin-full
  },

  EXAMS: {
    BASE: '/exams',
    DETAIL: (examId: string) => `/exams/${examId}` as const,
    PAPER: (examId: string) => `/exams/${examId}/paper` as const,
<<<<<<< HEAD
  }
} as const;
=======
  },

  ADMIN: {
    // Dashboard
    DASHBOARD_OVERVIEW: '/admin/dashboard/overview',

    // Users
    USERS: '/admin/users',
    USER: (id: string) => `/admin/users/${id}` as const,
    USER_ROLE: (id: string) => `/admin/users/${id}/role` as const,
    USER_STATUS: (id: string) => `/admin/users/${id}/status` as const,
    USER_RESET_PASSWORD: (id: string) => `/admin/users/${id}/reset-password` as const,

    // Exams
    EXAMS: '/admin/exams',
    EXAM_PUBLISH: (id: string) => `/admin/exams/${id}/publish` as const,

    // Classes
    CLASSES: '/admin/classes',
    CLASS_LOCK: (id: string) => `/admin/classes/${id}/lock` as const,

    // Questions
    QUESTIONS: '/admin/questions',
    QUESTION_ARCHIVE: (id: string) => `/admin/questions/${id}/archive` as const,

    // Taxonomy
    SUBJECTS: '/admin/taxonomy/subjects',
    SUBJECT: (id: string) => `/admin/taxonomy/subjects/${id}` as const,
    SUBJECT_TOPICS: (subjectId: string) => `/admin/taxonomy/subjects/${subjectId}/topics` as const,
    TOPICS: '/admin/taxonomy/topics',
    TOPIC: (id: string) => `/admin/taxonomy/topics/${id}` as const,

    // Pricing
    PRICING_PLANS: '/admin/pricing-plans',
    PRICING_PLAN: (id: string) => `/admin/pricing-plans/${id}` as const,

    // Teacher verification
    TEACHER_VERIFICATION: '/admin/teachers/verification',
    TEACHER_VERIFICATION_UPDATE: (id: string) => `/admin/teachers/${id}/verification` as const,

    // Business dashboard
    BUSINESS_METRICS: '/admin/business/metrics',
  },
} as const;
>>>>>>> feature/admin-full
