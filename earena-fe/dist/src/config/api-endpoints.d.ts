export declare const API_ENDPOINTS: {
    readonly AUTH: {
        readonly LOGIN: "/auth/login";
        readonly REGISTER: "/auth/register";
        readonly REGISTER_QUALIFICATION_UPLOAD: "/auth/register/qualification-upload";
        readonly LOGOUT: "/auth/logout";
        readonly REFRESH: "/auth/refresh";
        readonly ME: "/auth/me";
        readonly SEND_OTP: "/auth/send-otp";
        readonly VERIFY_OTP: "/auth/verify-otp";
        readonly RESET_PASSWORD: "/auth/reset-password";
        readonly CHANGE_PASSWORD: "/auth/change-password";
        readonly GOOGLE: "/auth/google";
    };
    readonly USERS: {
        readonly PROFILE: "/users/me/profile";
        readonly ME_FAST: "/users/me";
        readonly PUBLIC_PROFILE: (id: string) => `/users/${string}/public-profile`;
    };
    readonly MEDIA: {
        readonly UPLOAD_SINGLE: "/media/upload/single";
        readonly SIGNATURE: "/media/signature";
        readonly VIDEO_TICKET: "/media/upload/video/ticket";
        readonly DOCUMENT_TICKET: "/media/upload/document/ticket";
        readonly CONFIRM_UPLOAD: "/media/upload/confirm";
        readonly SYNC_CLOUDINARY: "/media/upload/cloudinary/sync";
    };
    readonly COURSES: {
        readonly PUBLIC: "/courses/public";
        readonly PUBLIC_FEATURED_CAROUSEL: "/courses/public/featured-carousel";
        readonly PUBLIC_DETAIL: (slug: string) => `/courses/public/${string}`;
        readonly STUDY_TREE: (courseId: string) => `/courses/${string}/study-tree`;
        readonly LESSON_CONTENT: (courseId: string, lessonId: string) => `/courses/${string}/lessons/${string}/content`;
        readonly BASE: "/courses";
        readonly DETAIL: (courseId: string) => `/courses/${string}`;
        readonly SECTIONS: (courseId: string) => `/courses/${string}/sections`;
        readonly LESSONS: (courseId: string, sectionId: string) => `/courses/${string}/sections/${string}/lessons`;
        readonly LESSON_DETAIL: (courseId: string, lessonId: string) => `/courses/${string}/lessons/${string}`;
        readonly QUIZ_BUILDER: "/courses/builder/quiz";
        readonly QUIZ_BUILDER_DETAIL: (lessonId: string) => `/courses/builder/quiz/${string}`;
        readonly QUIZ_BUILDER_PREVIEW: "/courses/builder/quiz/preview";
        readonly QUIZ_BUILDER_RULE_PREVIEW: "/courses/builder/quiz/rule-preview";
        readonly QUIZ_BUILDER_MATRICES: "/courses/builder/quiz/matrices";
        readonly QUIZ_BUILDER_HEALTH: (lessonId: string) => `/courses/builder/quiz/${string}/health`;
        readonly QUIZ_BUILDER_STATS: (lessonId: string) => `/courses/builder/quiz/${string}/stats`;
        readonly QUIZ_BUILDER_ATTEMPTS: (lessonId: string) => `/courses/builder/quiz/${string}/attempts`;
        readonly QUIZ_BUILDER_STATIC_QUESTIONS: (lessonId: string) => `/courses/builder/quiz/${string}/static-questions`;
        readonly REORDER: (courseId: string) => `/courses/${string}/curriculum/reorder`;
        readonly PUBLISH: (courseId: string) => `/courses/${string}/publish`;
        readonly SUBMIT_REVIEW: (courseId: string) => `/courses/${string}/submit-for-review`;
        readonly MY_LEARNING: "/courses/my-learning";
        readonly TEACHER_COURSES: "/courses/me";
        readonly TEACHER_DETAIL: (courseId: string) => `/courses/teacher/${string}`;
        readonly AI_GENERATE: (courseId: string) => `/courses/${string}/ai-builder/generate`;
        readonly TEACHER_DASHBOARD_STATS: (courseId: string) => `/courses/teacher/${string}/dashboard-stats`;
        readonly TEACHER_CURRICULUM_VIEW: (courseId: string) => `/courses/teacher/${string}/curriculum-view`;
        readonly REVIEWS: (courseId: string) => `/courses/${string}/reviews`;
        readonly REVIEW_REPLY: (courseId: string, reviewId: string) => `/courses/${string}/reviews/${string}/reply`;
        readonly PROMOTE: (courseId: string) => `/courses/${string}/promote`;
    };
    readonly MESSAGING: {
        readonly THREADS: "/messaging/threads";
        readonly UNREAD_COUNT: "/messaging/threads/unread-count";
        readonly SHAREABLE_COURSES: "/messaging/shareable-courses";
        readonly OPEN_THREAD: "/messaging/threads/open";
        readonly MESSAGES: (threadId: string) => `/messaging/threads/${string}/messages`;
        readonly SEND: (threadId: string) => `/messaging/threads/${string}/messages`;
        readonly MARK_READ: (threadId: string) => `/messaging/threads/${string}/read`;
    };
    readonly WALLETS: {
        readonly ME: "/wallets/me";
        readonly TRANSACTIONS: "/wallets/transactions";
        readonly MOCK_DEPOSIT: "/wallets/mock-deposit";
        readonly WITHDRAW: "/wallets/withdraw";
    };
    readonly ADMIN_WALLETS: {
        readonly WITHDRAWALS: "/admin/wallets/withdrawals";
        readonly PROCESS_WITHDRAWAL: (id: string) => `/admin/wallets/withdrawals/${string}/process`;
    };
    readonly ENROLLMENTS: {
        readonly ENROLL: (courseId: string) => `/enrollments/${string}/enroll`;
        readonly MARK_COMPLETED: "/enrollments/mark-completed";
    };
    readonly QUESTION_FOLDERS: {
        readonly BASE: "/question-folders";
        readonly DETAIL: (id: string) => `/question-folders/${string}`;
    };
    readonly QUESTIONS: {
        readonly BASE: "/questions";
        readonly BULK_CREATE: "/questions/bulk-create";
        readonly BULK_STANDARDIZE: "/questions/bulk-standardize";
        readonly BULK_MOVE: "/questions/bulk-move";
        readonly BULK_CLONE: "/questions/bulk-clone";
        readonly BULK_DELETE: "/questions/bulk-delete";
        readonly SUGGEST_FOLDERS: "/questions/suggest-folders";
        readonly AI_GENERATE: "/questions/ai-builder/generate";
        readonly ORGANIZE_PREVIEW: "/questions/organize/preview";
        readonly ORGANIZE_EXECUTE: "/questions/organize/execute";
        readonly CLONE: (id: string) => `/questions/${string}/clone`;
        readonly DETAIL: (id: string) => `/questions/${string}`;
        readonly PASSAGE: (id: string) => `/questions/${string}/passage`;
        readonly BULK_AUTO_TAG: "/questions/bulk-auto-tag";
        readonly BULK_PUBLISH: "/questions/bulk-publish";
        readonly ACTIVE_FILTERS: "/questions/active-filters";
    };
    readonly EXAMS: {
        readonly BASE: "/exams";
        readonly DETAIL: (examId: string) => `/exams/${string}`;
        readonly MANUAL_INIT: "/exams/manual/init";
        readonly PAPER_QUESTIONS: (paperId: string) => `/exams/manual/papers/${string}/questions`;
        readonly PAPER_PREVIEW: (paperId: string) => `/exams/manual/papers/${string}`;
        readonly GENERATE: "/exams/generate";
        readonly PUBLISH: (examId: string) => `/exams/${string}/publish`;
        readonly FILL_FROM_MATRIX: (paperId: string) => `/exams/manual/papers/${string}/fill-from-matrix`;
        readonly UPDATE_POINTS: (paperId: string) => `/exams/manual/papers/${string}/points`;
        readonly PREVIEW_MATRIX_RULE: (paperId: string) => `/exams/manual/papers/${string}/matrix/preview-rule`;
        readonly LEADERBOARD: (courseId: string, lessonId: string) => `/exams/leaderboard/courses/${string}/lessons/${string}`;
        readonly DYNAMIC_PREVIEW: "/exams/dynamic/preview";
    };
    readonly EXAM_MATRICES: {
        readonly BASE: "/exam-matrices";
        readonly DETAIL: (id: string) => `/exam-matrices/${string}`;
    };
    readonly EXAM_TAKING: {
        readonly START: "/exam-take/start";
        readonly AUTO_SAVE: (submissionId: string) => `/exam-take/${string}/auto-save`;
        readonly SUBMIT: (submissionId: string) => `/exam-take/${string}/submit`;
        readonly RESULT: (submissionId: string) => `/exam-take/${string}/result`;
        readonly HISTORY: "/exam-take/history";
        readonly HISTORY_OVERVIEW: "/exam-take/history/overview";
        readonly HISTORY_LESSON: (lessonId: string) => `/exam-take/history/lesson/${string}`;
    };
    readonly ADMIN: {
        readonly DASHBOARD_OVERVIEW: "/admin/dashboard/overview";
        readonly USERS: "/admin/users";
        readonly USER: (id: string) => `/admin/users/${string}`;
        readonly USER_ROLE: (id: string) => `/admin/users/${string}/role`;
        readonly USER_STATUS: (id: string) => `/admin/users/${string}/status`;
        readonly USER_RESET_PASSWORD: (id: string) => `/admin/users/${string}/reset-password`;
        readonly EXAMS: "/admin/exams";
        readonly EXAM_PUBLISH: (id: string) => `/admin/exams/${string}/publish`;
        readonly EXAM_PAPER_DETAIL_BY_EXAM: (examId: string) => `/admin/exams/${string}/paper`;
        readonly QUESTIONS: "/admin/questions";
        readonly QUESTION_ARCHIVE: (id: string) => `/admin/questions/${string}/archive`;
        readonly SUBJECTS: "/admin/taxonomy/subjects";
        readonly SUBJECT: (id: string) => `/admin/taxonomy/subjects/${string}`;
        readonly SUBJECT_TOPICS: (subjectId: string) => `/admin/taxonomy/subjects/${string}/topics`;
        readonly TOPICS: "/admin/taxonomy/topics";
        readonly TOPIC: (id: string) => `/admin/taxonomy/topics/${string}`;
        readonly PRICING_PLANS: "/admin/pricing-plans";
        readonly PRICING_PLAN: (id: string) => `/admin/pricing-plans/${string}`;
        readonly TEACHER_VERIFICATION: "/admin/teachers/verification";
        readonly TEACHER_VERIFICATION_UPDATE: (id: string) => `/admin/teachers/${string}/verification`;
        readonly BUSINESS_METRICS: "/admin/business/metrics";
        readonly COURSES_BASE: "/admin/courses";
        readonly COURSES_PENDING: "/admin/courses/pending";
        readonly COURSE_DETAIL: (id: string) => `/admin/courses/${string}`;
        readonly COURSE_APPROVE: (id: string) => `/admin/courses/${string}/approve`;
        readonly COURSE_REJECT: (id: string) => `/admin/courses/${string}/reject`;
        readonly COURSE_FORCE_TAKEDOWN: (id: string) => `/admin/courses/${string}/force-takedown`;
    };
    readonly TAXONOMY: {
        readonly SUBJECTS: "/taxonomy/subjects";
        readonly MY_SUBJECTS: "/taxonomy/my-subjects";
        readonly TOPICS_TREE: (subjectId: string) => `/taxonomy/topics/tree/${string}`;
    };
    readonly SUBSCRIPTIONS: {
        readonly PLANS: "/subscriptions/plans";
        readonly UPGRADE: "/subscriptions/upgrade";
    };
    readonly NOTIFICATIONS: {
        readonly BASE: "/notifications";
        readonly STREAM: "/notifications/stream";
        readonly READ: (id: string) => `/notifications/${string}/read`;
        readonly READ_ALL: "/notifications/read-all";
    };
    readonly LEARNING: {
        readonly HEARTBEAT: "/learning/heartbeat";
    };
    readonly COMMUNITY: {
        readonly UPLOAD_IMAGE: "/community/upload/image";
        readonly FEED: "/community/feed";
        readonly SIDEBAR: "/community/sidebar";
        readonly RECOMMENDED: "/community/recommended";
        readonly POSTS_BY_COURSE: (courseId: string) => `/community/posts/course/${string}`;
        readonly POST: (postId: string) => `/community/posts/${string}`;
        readonly POST_COMMENTS: (postId: string) => `/community/posts/${string}/comments`;
        readonly POSTS: "/community/posts";
        readonly POST_SAVE: (postId: string) => `/community/posts/${string}/save`;
        readonly POST_REACT: (postId: string) => `/community/posts/${string}/react`;
        readonly COMMENT_REACT: (commentId: string) => `/community/comments/${string}/react`;
        readonly POST_BEST_ANSWER: (postId: string) => `/community/posts/${string}/best-answer`;
        readonly POST_PIN: (postId: string) => `/community/posts/${string}/pin-comment`;
        readonly REPORTS: "/community/reports";
        readonly FOLLOWS: "/community/follows";
        readonly FOLLOW: (targetType: string, targetId: string) => `/community/follows/${string}/${string}`;
        readonly ME_SAVED: "/community/me/saved";
        readonly ME_FOLLOWING: "/community/me/following";
        readonly BLOCK: (userId: string) => `/community/blocks/${string}`;
        readonly PROFILE: (userId: string) => `/community/profile/${string}`;
    };
    readonly COMMUNITY_ADMIN: {
        readonly REPORTS: "/community/admin/reports";
        readonly REPORT_RESOLVE: (id: string) => `/community/admin/reports/${string}`;
        readonly POST_HIDE: (id: string) => `/community/admin/posts/${string}/hide`;
        readonly POST_SHOW: (id: string) => `/community/admin/posts/${string}/show`;
        readonly POST_FEATURE: (id: string) => `/community/admin/posts/${string}/feature`;
        readonly POST_LOCK_COMMENTS: (id: string) => `/community/admin/posts/${string}/lock-comments`;
        readonly USER_STATUS: (userId: string) => `/community/admin/users/${string}/community-status`;
        readonly AUDIT: "/community/admin/audit";
    };
};
