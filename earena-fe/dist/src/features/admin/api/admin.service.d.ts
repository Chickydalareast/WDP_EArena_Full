import type { AdminExam, AdminOverview, AdminQuestion, AdminUser, KnowledgeTopic, PageResult, Subject, Role, UserStatus, PricingPlan, PricingPlanCode, BusinessMetrics, RejectCoursePayload, AdminCourseApproval, ForceTakedownPayload, MasterListCourseStatus, AdminTeacherVerification, TeacherVerificationStatus } from '../types/admin.types';
export declare const adminService: {
    getOverview: () => Promise<AdminOverview>;
    listUsers: (params: {
        page?: number;
        limit?: number;
        search?: string;
        role?: Role;
        status?: UserStatus;
    }) => Promise<PageResult<AdminUser>>;
    createUser: (payload: {
        email: string;
        fullName: string;
        password: string;
        role: Role;
        status?: UserStatus;
    }) => Promise<any>;
    updateUserRole: (id: string, role: Role) => Promise<any>;
    updateUserStatus: (id: string, status: UserStatus) => Promise<any>;
    resetUserPassword: (id: string, newPassword?: string) => Promise<any>;
    deactivateUser: (id: string) => Promise<any>;
    listExams: (params: {
        page?: number;
        limit?: number;
        search?: string;
        type?: "OFFICIAL" | "PRACTICE";
        teacherId?: string;
    }) => Promise<PageResult<AdminExam>>;
    getExamPaperDetailByExamId: (examId: string) => Promise<unknown>;
    setExamPublish: (id: string, isPublished: boolean) => Promise<any>;
    deleteExam: (id: string) => Promise<any>;
    listQuestions: (params: {
        page?: number;
        limit?: number;
        search?: string;
        ownerId?: string;
        folderId?: string;
        topicId?: string;
    }) => Promise<PageResult<AdminQuestion>>;
    setQuestionArchived: (id: string, isArchived: boolean) => Promise<any>;
    deleteQuestion: (id: string) => Promise<any>;
    listSubjects: () => Promise<Subject[]>;
    createSubject: (payload: {
        name: string;
        code: string;
        isActive?: boolean;
    }) => Promise<any>;
    updateSubject: (id: string, payload: Partial<{
        name: string;
        code: string;
        isActive: boolean;
    }>) => Promise<any>;
    listTopicsBySubject: (subjectId: string) => Promise<KnowledgeTopic[]>;
    createTopic: (payload: {
        subjectId: string;
        name: string;
        level: number;
        parentId?: string;
    }) => Promise<any>;
    updateTopic: (id: string, payload: Partial<{
        name: string;
        level: number;
        parentId: string | null;
    }>) => Promise<any>;
    deleteTopic: (id: string) => Promise<any>;
    listPricingPlans: () => Promise<PricingPlan[]>;
    createPricingPlan: (payload: {
        name: string;
        code: PricingPlanCode;
        priceMonthly: number;
        priceYearly: number;
        benefits?: string[];
        isActive?: boolean;
    }) => Promise<any>;
    updatePricingPlan: (id: string, payload: Partial<{
        name: string;
        priceMonthly: number;
        priceYearly: number;
        benefits: string[];
        isActive: boolean;
    }>) => Promise<any>;
    getBusinessMetrics: (params?: {
        from?: string;
        to?: string;
    }) => Promise<BusinessMetrics>;
    listCourses: (params: {
        page?: number;
        limit?: number;
        search?: string;
        teacherId?: string;
        status?: MasterListCourseStatus;
    }) => Promise<PageResult<AdminCourseApproval>>;
    listPendingCourses: (params: {
        page?: number;
        limit?: number;
    }) => Promise<PageResult<AdminCourseApproval>>;
    getCourseDetailForReview: (id: string) => Promise<any>;
    approveCourse: (id: string) => Promise<void>;
    rejectCourse: (id: string, payload: RejectCoursePayload) => Promise<void>;
    forceTakedownCourse: (id: string, payload: ForceTakedownPayload) => Promise<void>;
    listTeacherVerifications: (params: {
        page?: number;
        limit?: number;
        status?: TeacherVerificationStatus | "PENDING";
        search?: string;
    }) => Promise<PageResult<AdminTeacherVerification>>;
    updateTeacherVerification: (id: string, payload: {
        status: TeacherVerificationStatus;
        note?: string;
    }) => Promise<void>;
};
