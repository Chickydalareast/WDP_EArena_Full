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
    GOOGLE: '/auth/google',
  },

  USERS: {
    PROFILE: '/users/me/profile',
    ME_FAST: '/users/me',
  },

  MEDIA: {
    UPLOAD_SINGLE: '/media/upload/single',
    SIGNATURE: '/media/signature',
    VIDEO_TICKET: '/media/upload/video/ticket',
    DOCUMENT_TICKET: '/media/upload/document/ticket',
    CONFIRM_UPLOAD: '/media/upload/confirm',
    SYNC_CLOUDINARY: '/media/upload/cloudinary/sync',
  },

  COURSES: {
    PUBLIC: '/courses/public',
    PUBLIC_DETAIL: (slug: string) => `/courses/public/${slug}` as const,

    STUDY_TREE: (courseId: string) => `/courses/${courseId}/study-tree` as const,
    LESSON_CONTENT: (courseId: string, lessonId: string) => `/courses/${courseId}/lessons/${lessonId}/content` as const,

    BASE: '/courses',
    DETAIL: (courseId: string) => `/courses/${courseId}` as const,
    SECTIONS: (courseId: string) => `/courses/${courseId}/sections` as const,
    LESSONS: (courseId: string, sectionId: string) => `/courses/${courseId}/sections/${sectionId}/lessons` as const,
    REORDER: (courseId: string) => `/courses/${courseId}/curriculum/reorder` as const,
    PUBLISH: (courseId: string) => `/courses/${courseId}/publish` as const,
    SUBMIT_REVIEW: (courseId: string) => `/courses/${courseId}/submit-for-review` as const,
    MY_LEARNING: '/courses/my-learning',

    TEACHER_COURSES: '/courses/me',
    TEACHER_DETAIL: (courseId: string) => `/courses/teacher/${courseId}` as const,
    AI_GENERATE: (courseId: string) => `/courses/${courseId}/ai-builder/generate` as const,

    REVIEWS: (courseId: string) => `/courses/${courseId}/reviews` as const,
    REVIEW_REPLY: (courseId: string, reviewId: string) => `/courses/${courseId}/reviews/${reviewId}/reply` as const,
  },

  WALLETS: {
    ME: '/wallets/me',
    TRANSACTIONS: '/wallets/transactions',
    MOCK_DEPOSIT: '/wallets/mock-deposit',
    WITHDRAW: '/wallets/withdraw',
  },
  ADMIN_WALLETS: {
    WITHDRAWALS: '/admin/wallets/withdrawals',
    PROCESS_WITHDRAWAL: (id: string) => `/admin/wallets/withdrawals/${id}/process` as const,
  },

  ENROLLMENTS: {
    ENROLL: (courseId: string) => `/enrollments/${courseId}/enroll` as const,
    MARK_COMPLETED: '/enrollments/mark-completed',
  },

  QUESTION_FOLDERS: {
    BASE: '/question-folders',
    DETAIL: (id: string) => `/question-folders/${id}` as const,
  },
QUESTIONS: {
    BASE: '/questions',
    BULK_CREATE: '/questions/bulk-create',
    BULK_MOVE: '/questions/bulk-move',
    BULK_CLONE: '/questions/bulk-clone',
    BULK_DELETE: '/questions/bulk-delete',
    AI_GENERATE: '/questions/ai-generate',
  
    ORGANIZE_PREVIEW: '/questions/organize/preview',
    ORGANIZE_EXECUTE: '/questions/organize/execute',
    
    CLONE: (id: string) => `/questions/${id}/clone` as const,
    DETAIL: (id: string) => `/questions/${id}` as const,
    
    PASSAGE: (id: string) => `/questions/${id}/passage` as const, 
    BULK_AUTO_TAG: '/questions/bulk-auto-tag',
  },


  EXAMS: {
    BASE: '/exams',
    MANUAL_INIT: '/exams/manual/init',
    PAPER_QUESTIONS: (paperId: string) => `/exams/manual/papers/${paperId}/questions` as const,
    PAPER_PREVIEW: (paperId: string) => `/exams/manual/papers/${paperId}` as const,
    GENERATE: '/exams/generate',
    PUBLISH: (examId: string) => `/exams/${examId}/publish` as const,
  },

  EXAM_TAKING: {
    START: '/exam-take/start',
    AUTO_SAVE: (submissionId: string) => `/exam-take/${submissionId}/auto-save` as const,
    SUBMIT: (submissionId: string) => `/exam-take/${submissionId}/submit` as const,
    RESULT: (submissionId: string) => `/exam-take/${submissionId}/result` as const,
    HISTORY: '/exam-take/history',
  },

  ADMIN: {
    DASHBOARD_OVERVIEW: '/admin/dashboard/overview',

    USERS: '/admin/users',
    USER: (id: string) => `/admin/users/${id}` as const,
    USER_ROLE: (id: string) => `/admin/users/${id}/role` as const,
    USER_STATUS: (id: string) => `/admin/users/${id}/status` as const,
    USER_RESET_PASSWORD: (id: string) => `/admin/users/${id}/reset-password` as const,

    EXAMS: '/admin/exams',
    EXAM_PUBLISH: (id: string) => `/admin/exams/${id}/publish` as const,

    QUESTIONS: '/admin/questions',
    QUESTION_ARCHIVE: (id: string) => `/admin/questions/${id}/archive` as const,

    SUBJECTS: '/admin/taxonomy/subjects',
    SUBJECT: (id: string) => `/admin/taxonomy/subjects/${id}` as const,
    SUBJECT_TOPICS: (subjectId: string) => `/admin/taxonomy/subjects/${subjectId}/topics` as const,
    TOPICS: '/admin/taxonomy/topics',
    TOPIC: (id: string) => `/admin/taxonomy/topics/${id}` as const,

    PRICING_PLANS: '/admin/pricing-plans',
    PRICING_PLAN: (id: string) => `/admin/pricing-plans/${id}` as const,

    TEACHER_VERIFICATION: '/admin/teachers/verification',
    TEACHER_VERIFICATION_UPDATE: (id: string) => `/admin/teachers/${id}/verification` as const,

    BUSINESS_METRICS: '/admin/business/metrics',

    COURSES_BASE: '/admin/courses',
    COURSES_PENDING: '/admin/courses/pending',
    COURSE_DETAIL: (id: string) => `/admin/courses/${id}` as const,
    COURSE_APPROVE: (id: string) => `/admin/courses/${id}/approve` as const,
    COURSE_REJECT: (id: string) => `/admin/courses/${id}/reject` as const,
    COURSE_FORCE_TAKEDOWN: (id: string) => `/admin/courses/${id}/force-takedown` as const,
  },

  TAXONOMY: {
    TOPICS_TREE: (subjectId: string) => `/taxonomy/topics/tree/${subjectId}` as const,
  },

  SUBSCRIPTIONS: {
    PLANS: '/subscriptions/plans',
    UPGRADE: '/subscriptions/upgrade',
  },

  NOTIFICATIONS: {
    BASE: '/notifications',
    STREAM: '/notifications/stream',
    READ: (id: string) => `/notifications/${id}/read` as const,
    READ_ALL: '/notifications/read-all',
  },
} as const;