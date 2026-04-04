export interface GetPendingCoursesPayload {
    page: number;
    limit: number;
}

export interface GetAdminCoursesPayload {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    teacherId?: string;
}

export interface ApproveCoursePayload {
    courseId: string;
    adminId: string;
}

export interface RejectCoursePayload {
    courseId: string;
    reason: string;
    adminId: string;
}

export interface ForceTakedownCoursePayload {
    courseId: string;
    reason: string;
    adminId: string;
}

export interface PreviewCourseQuizPayload {
    courseId: string;
    lessonId: string;
}