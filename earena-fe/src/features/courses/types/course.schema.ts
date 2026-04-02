import { z } from 'zod';
import { MyCourseReview } from './review.schema';
import { ExamRuleDTO } from './curriculum.schema';

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