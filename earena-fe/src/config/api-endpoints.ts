export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REGISTER_QUALIFICATION_UPLOAD: '/auth/register/qualification-upload',
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
    PUBLIC_PROFILE: (id: string) => `/users/${id}/public-profile` as const,
  },

  MEDIA: {
    /** @deprecated BE trả 400; ảnh dùng SIGNATURE + upload trực tiếp Cloudinary. */
    UPLOAD_SINGLE: '/media/upload/single',
    SIGNATURE: '/media/signature',
    VIDEO_TICKET: '/media/upload/video/ticket',
    DOCUMENT_TICKET: '/media/upload/document/ticket',
    CONFIRM_UPLOAD: '/media/upload/confirm',
    SYNC_CLOUDINARY: '/media/upload/cloudinary/sync',
  },

  COURSES: {
    PUBLIC: '/courses/public',
    PUBLIC_FEATURED_CAROUSEL: '/courses/public/featured-carousel',
    PUBLIC_DETAIL: (slug: string) => `/courses/public/${slug}` as const,

    STUDY_TREE: (courseId: string) => `/courses/${courseId}/study-tree` as const,
    LESSON_CONTENT: (courseId: string, lessonId: string) => `/courses/${courseId}/lessons/${lessonId}/content` as const,

    BASE: '/courses',
    DETAIL: (courseId: string) => `/courses/${courseId}` as const,
    SECTIONS: (courseId: string) => `/courses/${courseId}/sections` as const,
    LESSONS: (courseId: string, sectionId: string) => `/courses/${courseId}/sections/${sectionId}/lessons` as const,
    LESSON_DETAIL: (courseId: string, lessonId: string) => `/courses/${courseId}/lessons/${lessonId}` as const,
    QUIZ_BUILDER: '/courses/builder/quiz',
    
    QUIZ_BUILDER_DETAIL: (lessonId: string) => `/courses/builder/quiz/${lessonId}` as const,
    QUIZ_BUILDER_PREVIEW: '/courses/builder/quiz/preview',
    QUIZ_BUILDER_RULE_PREVIEW: '/courses/builder/quiz/rule-preview',
    QUIZ_BUILDER_MATRICES: '/courses/builder/quiz/matrices',
    QUIZ_BUILDER_HEALTH: (lessonId: string) => `/courses/builder/quiz/${lessonId}/health` as const,
    QUIZ_BUILDER_STATS: (lessonId: string) => `/courses/builder/quiz/${lessonId}/stats` as const,
    QUIZ_BUILDER_ATTEMPTS: (lessonId: string) => `/courses/builder/quiz/${lessonId}/attempts` as const,
    QUIZ_BUILDER_STATIC_QUESTIONS: (lessonId: string) => `/courses/builder/quiz/${lessonId}/static-questions` as const,
    
    REORDER: (courseId: string) => `/courses/${courseId}/curriculum/reorder` as const,
    PUBLISH: (courseId: string) => `/courses/${courseId}/publish` as const,
    SUBMIT_REVIEW: (courseId: string) => `/courses/${courseId}/submit-for-review` as const,
    MY_LEARNING: '/courses/my-learning',

    TEACHER_COURSES: '/courses/me',
    TEACHER_DETAIL: (courseId: string) => `/courses/teacher/${courseId}` as const,
    AI_GENERATE: (courseId: string) => `/courses/${courseId}/ai-builder/generate` as const,

    TEACHER_DASHBOARD_STATS: (courseId: string) => `/courses/teacher/${courseId}/dashboard-stats` as const,
    TEACHER_CURRICULUM_VIEW: (courseId: string) => `/courses/teacher/${courseId}/curriculum-view` as const,

    REVIEWS: (courseId: string) => `/courses/${courseId}/reviews` as const,
    REVIEW_REPLY: (courseId: string, reviewId: string) => `/courses/${courseId}/reviews/${reviewId}/reply` as const,

    PROMOTE: (courseId: string) => `/courses/${courseId}/promote` as const,
  },

  MESSAGING: {
    THREADS: '/messaging/threads',
    UNREAD_COUNT: '/messaging/threads/unread-count',
    SHAREABLE_COURSES: '/messaging/shareable-courses',
    OPEN_THREAD: '/messaging/threads/open',
    MESSAGES: (threadId: string) => `/messaging/threads/${threadId}/messages` as const,
    SEND: (threadId: string) => `/messaging/threads/${threadId}/messages` as const,
    MARK_READ: (threadId: string) => `/messaging/threads/${threadId}/read` as const,
  },

  WALLETS: {
    ME: '/wallets/me',
    TRANSACTIONS: '/wallets/transactions',
    MOCK_DEPOSIT: '/wallets/mock-deposit',
    WITHDRAW: '/wallets/withdraw',
  },

  // Giữ lại block PAYMENT từ nhánh payos-integration-v2
  PAYMENT: {
    CREATE_EMBEDDED_LINK: '/payment/create-embedded-link',
    CONFIRM_RETURN: '/payment/confirm-return',
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
    BULK_STANDARDIZE: '/questions/bulk-standardize',
    BULK_MOVE: '/questions/bulk-move',
    BULK_CLONE: '/questions/bulk-clone',
    BULK_DELETE: '/questions/bulk-delete',
    SUGGEST_FOLDERS: '/questions/suggest-folders',
    AI_GENERATE: '/questions/ai-builder/generate',
    AI_GENERATE_FROM_LECTURE: '/questions/ai-builder/generate-from-lecture',
  
    ORGANIZE_PREVIEW: '/questions/organize/preview',
    ORGANIZE_EXECUTE: '/questions/organize/execute',
    
    CLONE: (id: string) => `/questions/${id}/clone` as const,
    DETAIL: (id: string) => `/questions/${id}` as const,
    
    PASSAGE: (id: string) => `/questions/${id}/passage` as const, 
    BULK_AUTO_TAG: '/questions/bulk-auto-tag',
    BULK_PUBLISH: '/questions/bulk-publish',

    ACTIVE_FILTERS: '/questions/active-filters',
  },

  EXAMS: {
    BASE: '/exams',
    DETAIL: (examId: string) => `/exams/${examId}` as const,
    MANUAL_INIT: '/exams/manual/init',
    PAPER_QUESTIONS: (paperId: string) => `/exams/manual/papers/${paperId}/questions` as const,
    PAPER_PREVIEW: (paperId: string) => `/exams/manual/papers/${paperId}` as const,
    GENERATE: '/exams/generate',
    PUBLISH: (examId: string) => `/exams/${examId}/publish` as const,

    FILL_FROM_MATRIX: (paperId: string) => `/exams/manual/papers/${paperId}/fill-from-matrix` as const,
    UPDATE_POINTS: (paperId: string) => `/exams/manual/papers/${paperId}/points` as const,

    PREVIEW_MATRIX_RULE: (paperId: string) => `/exams/manual/papers/${paperId}/matrix/preview-rule` as const,
    
    LEADERBOARD: (courseId: string, lessonId: string) => `/exams/leaderboard/courses/${courseId}/lessons/${lessonId}` as const,

    DYNAMIC_PREVIEW: '/exams/dynamic/preview',
  },

  EXAM_MATRICES: {
    ROOT: '/exam-matrices', // Lấy ROOT theo nhánh main
    DETAIL: (id: string) => `/exam-matrices/${id}` as const,
  },

  EXAM_TAKING: {
    START: '/exam-take/start',
    PAPER: (submissionId: string) => `/exam-take/${submissionId}/paper` as const, // Cập nhật từ nhánh main
    AUTO_SAVE: (submissionId: string) => `/exam-take/${submissionId}/auto-save` as const,
    SUBMIT: (submissionId: string) => `/exam-take/${submissionId}/submit` as const,
    RESULT: (submissionId: string) => `/exam-take/${submissionId}/result` as const,
    HISTORY: '/exam-take/history',
    HISTORY_OVERVIEW: '/exam-take/history/overview',
    HISTORY_LESSON: (lessonId: string) => `/exam-take/history/lesson/${lessonId}` as const,
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
    EXAM_PAPER_DETAIL_BY_EXAM: (examId: string) => `/admin/exams/${examId}/paper` as const,

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

    COURSE_LESSON_QUIZ_PREVIEW: (courseId: string, lessonId: string) => // Cập nhật từ nhánh main
      `/admin/courses/${courseId}/lessons/${lessonId}/preview-quiz` as const,
  },

  TAXONOMY: {
    SUBJECTS: '/taxonomy/subjects',
    MY_SUBJECTS: '/taxonomy/my-subjects',
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

  LEARNING: {
    HEARTBEAT: '/learning/heartbeat',
    // Cập nhật thêm các endpoints tracking từ nhánh main
    TRACKING_MEMBERS: (courseId: string) => `/learning/${courseId}/tracking/members` as const,
    TRACKING_MEMBER_EXAMS: (courseId: string, studentId: string) => `/learning/${courseId}/tracking/members/${studentId}/exams` as const,
    TRACKING_MEMBER_ATTEMPTS: (courseId: string, studentId: string, lessonId: string) => `/learning/${courseId}/tracking/members/${studentId}/lessons/${lessonId}/attempts` as const,
  },

  COMMUNITY: {
    UPLOAD_IMAGE: '/community/upload/image',
    FEED: '/community/feed',
    SIDEBAR: '/community/sidebar',
    RECOMMENDED: '/community/recommended',
    POSTS_BY_COURSE: (courseId: string) => `/community/posts/course/${courseId}` as const,
    POST: (postId: string) => `/community/posts/${postId}` as const,
    POST_COMMENTS: (postId: string) => `/community/posts/${postId}/comments` as const,
    POSTS: '/community/posts',
    POST_SAVE: (postId: string) => `/community/posts/${postId}/save` as const,
    POST_REACT: (postId: string) => `/community/posts/${postId}/react` as const,
    COMMENT_REACT: (commentId: string) => `/community/comments/${commentId}/react` as const,
    POST_BEST_ANSWER: (postId: string) => `/community/posts/${postId}/best-answer` as const,
    POST_PIN: (postId: string) => `/community/posts/${postId}/pin-comment` as const,
    REPORTS: '/community/reports',
    FOLLOWS: '/community/follows',
    FOLLOW: (targetType: string, targetId: string) =>
      `/community/follows/${targetType}/${targetId}` as const,
    ME_SAVED: '/community/me/saved',
    ME_FOLLOWING: '/community/me/following',
    BLOCK: (userId: string) => `/community/blocks/${userId}` as const,
    PROFILE: (userId: string) => `/community/profile/${userId}` as const,
  },

  COMMUNITY_ADMIN: {
    REPORTS: '/community/admin/reports',
    REPORT_RESOLVE: (id: string) => `/community/admin/reports/${id}` as const,
    POST_HIDE: (id: string) => `/community/admin/posts/${id}/hide` as const,
    POST_SHOW: (id: string) => `/community/admin/posts/${id}/show` as const,
    POST_FEATURE: (id: string) => `/community/admin/posts/${id}/feature` as const,
    POST_LOCK_COMMENTS: (id: string) => `/community/admin/posts/${id}/lock-comments` as const,
    USER_STATUS: (userId: string) => `/community/admin/users/${userId}/community-status` as const,
    AUDIT: '/community/admin/audit',
  },

  DISCUSSIONS: {
    QUESTIONS: (lessonId: string) => `/courses/discussions/lessons/${lessonId}/questions` as const,
    REPLIES: (parentId: string) => `/courses/discussions/questions/${parentId}/replies` as const,
    POST_QUESTION: '/courses/discussions/questions',
    POST_REPLY: '/courses/discussions/replies',

    COURSE_QUESTIONS: (courseId: string) => `/courses/discussions/courses/${courseId}/questions` as const,
  },
} as const;