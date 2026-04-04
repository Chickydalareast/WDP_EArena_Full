export declare class MediaResponseDto {
    id: string;
    url?: string | null;
    blurHash?: string | null;
    duration?: number | null;
    originalName?: string;
    mimetype?: string;
    size?: number;
}
export declare class ExamRuleConfigResponseDto {
    timeLimit: number;
    maxAttempts: number;
    passPercentage: number;
    showResultMode: string;
}
export declare class LessonResponseDto {
    id: string;
    title: string;
    order: number;
    isFreePreview: boolean;
    content?: string | null;
    examId?: string | null;
    examMode?: string | null;
    examType?: string | null;
    isCompleted?: boolean;
    examRules?: ExamRuleConfigResponseDto | null;
    primaryVideo?: MediaResponseDto | null;
    attachments?: MediaResponseDto[];
    progress?: LessonProgressResponseDto | null;
}
export declare class SectionResponseDto {
    id: string;
    title: string;
    description?: string;
    order: number;
    lessons: LessonResponseDto[];
}
export declare class CurriculumResponseDto {
    id: string;
    totalLessons: number;
    totalVideos: number;
    totalDocuments: number;
    totalQuizzes: number;
    sections: SectionResponseDto[];
}
export declare class CourseTeacherDto {
    id: string;
    fullName: string;
    avatar?: string;
    bio?: string;
}
export declare class CourseSubjectDto {
    id: string;
    name: string;
}
export declare class CourseBasicDto {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    discountPrice?: number;
    status: string;
    averageRating: number;
    totalReviews: number;
    benefits: string[];
    requirements: string[];
    createdAt: Date;
    updatedAt: Date;
    teacher: CourseTeacherDto;
    subject: CourseSubjectDto;
    coverImage?: MediaResponseDto;
    promotionalVideo?: MediaResponseDto;
    progressionMode: string;
    isStrictExam: boolean;
}
export declare class CoursePublicDetailResponseDto {
    isEnrolled: boolean;
    course: CourseBasicDto;
    curriculum: CurriculumResponseDto;
}
export declare class StudyTreeResponseDto {
    progress: number;
    status: string;
    curriculum: CurriculumResponseDto;
    myReview: MyCourseReviewDto | null;
    progressionMode: string;
    isStrictExam: boolean;
}
export declare class MyCourseReviewDto {
    id: string;
    rating: number;
    comment: string | null;
    teacherReply: string | null;
    repliedAt: Date | null;
    createdAt: Date;
}
export declare class LessonProgressResponseDto {
    watchTime: number;
    lastPosition: number;
    isCompleted: boolean;
}
