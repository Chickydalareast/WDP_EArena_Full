import { z } from 'zod';
import { MyCourseReview } from './review.schema';
import { ExamRuleDTO } from './curriculum.schema';
export declare enum CourseStatus {
    DRAFT = "DRAFT",
    PENDING_REVIEW = "PENDING_REVIEW",
    PUBLISHED = "PUBLISHED",
    REJECTED = "REJECTED",
    ARCHIVED = "ARCHIVED"
}
export declare const ProgressionModeEnum: any;
export type ProgressionMode = z.infer<typeof ProgressionModeEnum>;
export interface AttachmentData {
    id: string;
    url: string | null;
    originalName: string;
    mimetype?: string;
    size?: number;
}
export interface PrimaryVideoData {
    id: string;
    url: string | null;
    blurHash?: string;
    duration?: number;
}
export interface LessonPreview {
    id: string;
    title: string;
    order: number;
    isFreePreview: boolean;
    examId?: string;
    examMode?: 'STATIC' | 'DYNAMIC' | null;
    examType?: 'COURSE_QUIZ' | 'PRACTICE' | 'OFFICIAL' | null;
    isCompleted?: boolean;
    content?: string;
    primaryVideo?: PrimaryVideoData;
    attachments?: AttachmentData[];
    createdAt?: string;
    updatedAt?: string;
}
export interface SectionPreview {
    id: string;
    title: string;
    order: number;
    lessons: LessonPreview[];
}
export interface CourseBasic {
    id: string;
    slug: string;
    title: string;
    description?: string;
    price: number;
    discountPrice?: number;
    status: CourseStatus;
    coverImage?: {
        id: string;
        url: string;
        blurHash?: string;
    } | null;
    promotionalVideoId?: string | null;
    averageRating?: number;
    totalReviews?: number;
    studentCount?: number;
    teacherId?: string;
    teacher?: {
        id: string;
        fullName: string;
        avatar?: string;
        bio?: string | null;
    };
    subject?: {
        id: string;
        name: string;
    };
    benefits?: string[];
    requirements?: string[];
    createdAt?: string;
    updatedAt?: string;
    totalLessons?: number;
    totalVideos?: number;
    totalDocuments?: number;
    totalQuizzes?: number;
    submittedAt?: string;
    rejectionReason?: string;
    isEnrolled?: boolean;
}
export interface CourseTeacherDetail extends CourseBasic {
    createdAt: string;
    updatedAt: string;
    progressionMode?: 'FREE' | 'STRICT_LINEAR';
    isStrictExam?: boolean;
    curriculum?: {
        sections: SectionPreview[];
    };
}
export interface PublicCourseDetail extends CourseBasic {
    curriculum: {
        sections: SectionPreview[];
        totalLessons?: number;
        totalVideos?: number;
        totalDocuments?: number;
        totalQuizzes?: number;
    };
}
export interface StudyTreeResponse {
    progress: number;
    status: 'ACTIVE' | 'EXPIRED' | 'BANNED';
    progressionMode: 'FREE' | 'STRICT_LINEAR';
    isStrictExam: boolean;
    curriculum: {
        sections: SectionPreview[];
    };
    myReview: MyCourseReview | null;
}
export interface LessonProgressResponseDto {
    watchTime: number;
    lastPosition: number;
    isCompleted: boolean;
}
export interface LessonContentResponse {
    id: string;
    content?: string;
    examId?: string;
    examRules?: ExamRuleDTO;
    primaryVideo?: PrimaryVideoData;
    attachments?: AttachmentData[];
    progress?: LessonProgressResponseDto | null;
}
export interface CourseDashboardStats {
    totalStudents: number;
    averageProgress: number;
    averageRating: number;
    totalReviews: number;
    pendingReviews: number;
    totalRevenue: number;
}
export declare const reorderCurriculumSchema: any;
export type ReorderCurriculumPayload = z.infer<typeof reorderCurriculumSchema>;
export declare const createCourseSchema: any;
export type CreateCourseDTO = z.infer<typeof createCourseSchema>;
export declare const baseUpdateCourseSchema: any;
export declare const updateCourseSchema: any;
export type UpdateCourseDTO = z.infer<typeof updateCourseSchema>;
export type { ExamRuleDTO };
export interface TeacherLessonQuizDynamicConfig {
    matrixId: string | null;
    adHocSections: Array<{
        name: string;
        orderIndex: number;
        rules: Array<{
            folderIds: string[];
            topicIds: string[];
            difficulties: Array<'NB' | 'TH' | 'VD' | 'VDC'>;
            tags: string[];
            limit: number;
        }>;
    }>;
}
export interface TeacherLessonPopulatedExam {
    _id: string;
    title: string;
    totalScore: number;
    mode: 'DYNAMIC' | 'STATIC';
    type: 'COURSE_QUIZ';
    isPublished: boolean;
    dynamicConfig: TeacherLessonQuizDynamicConfig;
}
export interface TeacherLessonQuizDetail {
    _id: string;
    courseId: string;
    sectionId: string;
    title: string;
    content: string;
    order: number;
    isFreePreview: boolean;
    type: 'QUIZ' | 'VIDEO' | 'DOCUMENT' | 'MIXED';
    examRules: ExamRuleDTO;
    examId: TeacherLessonPopulatedExam | null;
    attachments: Array<{
        id: string;
        url: string | null;
        originalName: string;
        mimetype?: string;
    }>;
    primaryVideo?: {
        id: string;
        url: string | null;
        duration?: number;
    };
    createdAt: string;
    updatedAt: string;
}
export declare const QuizRulePreviewPayloadSchema: any;
export type QuizRulePreviewPayloadDTO = z.infer<typeof QuizRulePreviewPayloadSchema>;
export interface QuizRulePreviewResponse {
    availableCount: number;
    requiredCount: number;
    isSufficient: boolean;
    safetyRatio: number;
}
export declare const QuizBuilderPreviewPayloadSchema: any;
export type QuizBuilderPreviewPayloadDTO = z.infer<typeof QuizBuilderPreviewPayloadSchema>;
export interface QuizBuilderPreviewResponse {
    totalItems: number;
    totalActualQuestions: number;
    previewData: {
        questions: Array<{
            originalQuestionId: string;
            type: 'MULTIPLE_CHOICE' | 'PASSAGE';
            content: string;
            answers: Array<{
                id: string;
                content: string;
            }>;
        }>;
    };
}
export interface QuizMatrixItem {
    _id: string;
    title: string;
    description?: string;
    createdAt: string;
}
export interface QuizMatricesResponse {
    items: QuizMatrixItem[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
export declare const QuizHealthRuleStatusSchema: any;
export declare const QuizHealthDataSchema: any;
export type QuizHealthRuleStatus = z.infer<typeof QuizHealthRuleStatusSchema>;
export type QuizHealthData = z.infer<typeof QuizHealthDataSchema>;
export interface QuizHealthResponse {
    message: string;
    data: QuizHealthData;
}
