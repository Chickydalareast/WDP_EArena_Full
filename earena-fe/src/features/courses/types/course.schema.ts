import { z } from 'zod';
import { MyCourseReview } from './review.schema';
import { ExamRuleDTO } from './curriculum.schema';
import { MatrixRuleSchema, MatrixSectionSchema } from '@/features/exam-builder/types/exam.schema';

export enum CourseStatus {
    DRAFT = 'DRAFT',
    PENDING_REVIEW = 'PENDING_REVIEW',
    PUBLISHED = 'PUBLISHED',
    REJECTED = 'REJECTED',
    ARCHIVED = 'ARCHIVED',
}

export const ProgressionModeEnum = z.enum(['FREE', 'STRICT_LINEAR']);
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
    teacher?: { id: string; fullName: string; avatar?: string; bio?: string | null };
    subject?: { id: string; name: string };

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

export const reorderCurriculumSchema = z.object({
    sections: z.array(
        z.object({
            id: z.string().min(1, 'Thiếu ID Chương'),
            order: z.number().min(1),
        })
    ).default([]),
    lessons: z.array(
        z.object({
            id: z.string().min(1, 'Thiếu ID Bài học'),
            order: z.number().min(1),
            sectionId: z.string().min(1, 'Bắt buộc phải có sectionId để phòng kéo thả chéo chương'),
        })
    ).default([]),
});

export type ReorderCurriculumPayload = z.infer<typeof reorderCurriculumSchema>;

export const createCourseSchema = z.object({
    title: z.string().min(1, 'Tên khóa học không được để trống'),
    price: z.coerce.number().min(0, 'Giá khóa học không được âm'),
    description: z.string().optional(),
    progressionMode: ProgressionModeEnum.default('FREE'),
    isStrictExam: z.boolean().default(false),
});

export type CreateCourseDTO = z.infer<typeof createCourseSchema>;

export const baseUpdateCourseSchema = z.object({
    title: z.string().min(1, 'Tên không được để trống').optional(),
    price: z.coerce.number().min(0).optional(),
    discountPrice: z.coerce.number().min(0).optional(),
    description: z.string().optional(),
    benefits: z.array(z.string()).optional(),
    requirements: z.array(z.string()).optional(),
    coverImageId: z.string().nullable().optional(),
    promotionalVideoId: z.string().nullable().optional(),

    progressionMode: ProgressionModeEnum.optional(),
    isStrictExam: z.boolean().optional(),
});

export const updateCourseSchema = baseUpdateCourseSchema.superRefine((data, ctx) => {
    if (typeof data.price === 'number' && typeof data.discountPrice === 'number') {
        if (data.discountPrice > data.price) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Giá khuyến mãi không được lớn hơn giá gốc",
                path: ["discountPrice"],
            });
        }
    }
});

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

export const QuizRulePreviewPayloadSchema = z.object({
    questionType: z.enum(['FLAT', 'PASSAGE', 'MIXED']),
    limit: z.number().min(1, 'Số lượng tối thiểu là 1'),
    subQuestionLimit: z.number().optional(),
    folderIds: z.array(z.string()).min(1, 'Phải chọn ít nhất 1 thư mục'),
    topicIds: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    difficulties: z.array(z.enum(['NB', 'TH', 'VD', 'VDC'])).default([]),
}).superRefine((data, ctx) => {
    if (data.questionType === 'PASSAGE') {
        if (!data.subQuestionLimit || data.subQuestionLimit < 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Bắt buộc nhập số lượng câu hỏi con cho Đoạn văn',
                path: ['subQuestionLimit'],
            });
        }
    }
});

export type QuizRulePreviewPayloadDTO = z.infer<typeof QuizRulePreviewPayloadSchema>;

export interface QuizRulePreviewResponse {
    availableCount: number;
    requiredCount: number;
    isSufficient: boolean;
    safetyRatio: number;
}

export const QuizBuilderPreviewPayloadSchema = z.object({
    adHocSections: z.array(MatrixSectionSchema).optional(),
    matrixId: z.string().optional(),
}).refine(
    (data) => data.matrixId || (data.adHocSections && data.adHocSections.length > 0),
    { message: 'Phải cung cấp matrixId hoặc adHocSections', path: ['adHocSections'] }
);

export type QuizBuilderPreviewPayloadDTO = z.infer<typeof QuizBuilderPreviewPayloadSchema>;

export interface QuizBuilderPreviewResponse {
    totalItems: number;
    totalActualQuestions: number;
    previewData: {
        questions: Array<{
            originalQuestionId: string;
            type: 'MULTIPLE_CHOICE' | 'PASSAGE';
            content: string;
            answers: Array<{ id: string; content: string }>;
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

export const QuizHealthRuleStatusSchema = z.object({
    sectionName: z.string(),
    questionType: z.enum(['FLAT', 'PASSAGE', 'MIXED']).optional(),
    requiredCount: z.number(),
    availableCount: z.number(),
    isSufficient: z.boolean(),
    safetyRatio: z.number(),
    isWarning: z.boolean(),
    errorMessage: z.string().nullable().optional(),
});

export const QuizHealthDataSchema = z.object({
    lessonId: z.string(),
    examId: z.string(),
    isHealthy: z.boolean(),
    hasWarning: z.boolean(),
    isLocked: z.boolean(),
    matrixExists: z.boolean().nullable(),
    configMode: z.enum(['matrix', 'adHoc', 'unconfigured', 'snapshot', 'matrix_missing']),
    rules: z.array(QuizHealthRuleStatusSchema),
});

export type QuizHealthRuleStatus = z.infer<typeof QuizHealthRuleStatusSchema>;
export type QuizHealthData = z.infer<typeof QuizHealthDataSchema>;

export interface QuizHealthResponse {
    message: string;
    data: QuizHealthData;
}


export interface QuizStatsData {
    passRate: number;
    averageScore: number;
    totalCompletedSubmissions: number;
    scoreDistribution: Array<{
        range?: string;
        count?: number;
        [key: string]: any;
    }>;
    topWrongQuestions: any[];
}

export interface QuizStatsResponse {
    statusCode?: number;
    message: string;
    data: QuizStatsData;
}

export interface QuizStatsResponse {
    message: string;
    data: QuizStatsData;
}

export const AttemptStatusEnum = z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']);
export type AttemptStatus = z.infer<typeof AttemptStatusEnum>;

export interface QuizAttemptItem {
    id: string;
    studentId: string;
    studentName: string;
    studentEmail?: string;
    score: number | null;
    status: AttemptStatus;
    startedAt: string;
    completedAt: string | null;
}

export interface QuizAttemptsResponse {
    message: string;
    data: QuizAttemptItem[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
}

export type LessonComputedType = 'VIDEO' | 'QUIZ' | 'READING';

export interface LessonDetailResponse {
    id: string;
    title: string;
    content?: string;
    type: LessonComputedType;
    isFreePreview: boolean;
    orderIndex: number;

    examId?: string;
    primaryVideoId?: string;
    attachments?: string[];

    dynamicConfig?: any;
    examRules?: {
        timeLimit: number;
        maxAttempts: number;
        passPercentage: number;
        showResultMode: string;
    };
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

export interface TrackingMember {
    userId: string;
    fullName: string;
    email: string;
    avatar: string | null;
    progress: number;
    completedLessonsCount: number;
    enrolledAt: string;
}

export interface GetTrackingMembersParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'progress' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

export interface TrackingExamOverview {
    lessonId: string;
    lessonTitle: string;
    courseId: string;
    courseTitle: string;
    attemptsUsed: number;
    bestScore: number;
    latestSubmittedAt: string;
    maxAttempts: number;
    passPercentage: number;
}

export interface GetTrackingExamsParams {
    page?: number;
    limit?: number;
}

export interface TrackingAttemptDetail {
    _id: string;
    studentId: string;
    courseId: string;
    lessonId: string;
    examId: string;
    examPaperId: string;
    attemptNumber: number;
    score: number | null;
    status: AttemptStatus;
    submittedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface GetTrackingAttemptsParams {
    page?: number;
    limit?: number;
}