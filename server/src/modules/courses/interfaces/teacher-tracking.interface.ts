export interface IGetCourseMembersParams {
    courseId: string;
    teacherId: string;
    page: number;
    limit: number;
    search?: string;
    sortBy?: 'progress' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

export interface ICourseMemberOverview {
    userId: string;
    fullName: string;
    email: string;
    avatar: string | null;
    progress: number;
    completedLessonsCount: number;
    enrolledAt: Date;
}

export interface IStudentAnalyticsParams {
    courseId: string;
    teacherId: string;
    studentId: string;
    page: number;
    limit: number;
}

export interface IStudentLessonAttemptsParams extends IStudentAnalyticsParams {
    lessonId: string;
}