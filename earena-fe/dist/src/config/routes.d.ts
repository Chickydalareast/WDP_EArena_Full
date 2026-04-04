export declare const ROUTES: {
    readonly PUBLIC: {
        readonly HOME: "/";
        readonly COURSES: "/courses";
        readonly COURSE_DETAIL: (slug: string) => `/courses/${string}`;
        readonly PRICING: "/pricing";
        readonly COMMUNITY: "/community";
        readonly COMMUNITY_SUBJECT: (subjectId: string) => `/community/subject/${string}`;
        readonly COMMUNITY_POST: (postId: string) => `/community/post/${string}`;
        readonly COMMUNITY_PROFILE: (userId: string) => `/community/profile/${string}`;
    };
    readonly AUTH: {
        readonly LOGIN: "/login";
        readonly REGISTER: "/register";
        readonly FORGOT_PASSWORD: "/forgot-password";
        readonly WAITING_APPROVAL: "/waiting-approval";
    };
    readonly STUDENT: {
        readonly DASHBOARD: "/student";
        readonly PROFILE: "/student/profile";
        readonly MY_COURSES: "/student/courses";
        readonly WALLET: "/student/wallet";
        readonly STUDY_ROOM: (courseId: string, lessonId?: string) => `/student/courses/${string}/study?lessonId=${string}` | `/student/courses/${string}/study`;
        readonly EXAM_RESULT: (submissionId: string) => `/student/exams/${string}/result`;
        readonly HISTORY: "/student/history";
        readonly MESSAGES: "/student/messages";
    };
    readonly TEACHER: {
        readonly DASHBOARD: "/teacher";
        readonly PROFILE: "/teacher/profile";
        readonly EXAMS: "/teacher/exams";
        readonly CREATE_EXAM: "/teacher/exams/create";
        readonly EXAM_BUILDER: (examId: string) => `/teacher/exams/${string}/builder`;
        readonly COURSES: "/teacher/courses";
        readonly COURSE_DETAIL: (courseId: string) => `/teacher/courses/${string}`;
        readonly COURSE_CURRICULUM: (courseId: string) => `/teacher/courses/${string}/curriculum`;
        readonly COURSE_SETTINGS: (courseId: string) => `/teacher/courses/${string}/settings`;
        readonly COURSE_BUILDER: (id: string) => string;
        readonly QUESTIONS: "/teacher/questions";
        readonly WALLET: "/teacher/wallet";
        readonly SUBSCRIPTION: "/teacher/subscription";
        readonly MESSAGES: "/teacher/messages";
    };
    readonly ADMIN: {
        readonly DASHBOARD: "/admin";
        readonly BUSINESS: "/admin/business";
        readonly TEACHERS: "/admin/teachers";
        readonly USERS: "/admin/users";
        readonly EXAMS: "/admin/exams";
        readonly COURSES: "/admin/courses";
        readonly QUESTIONS: "/admin/questions";
        readonly TAXONOMY: "/admin/taxonomy";
        readonly PRICING: "/admin/pricing";
        readonly VERIFICATION: "/admin/teachers/verification";
        readonly WITHDRAWALS: "/admin/withdrawals";
    };
};
export declare const PUBLIC_PATHS: string[];
export declare const ROLE_ROOT_PATHS: {
    readonly STUDENT: "/student";
    readonly TEACHER: "/teacher";
    readonly ADMIN: "/admin";
};
