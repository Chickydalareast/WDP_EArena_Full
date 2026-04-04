import { Types } from 'mongoose';
import { ProgressionMode } from '../enums/progression-mode.enum';
import { DifficultyLevel } from 'src/modules/questions/schemas/question.schema';
export interface EmbeddedExamRulePayload {
    folderIds?: string[];
    topicIds?: string[];
    difficulties?: DifficultyLevel[];
    tags?: string[];
    limit: number;
}
export interface EmbeddedExamSectionPayload {
    name: string;
    orderIndex: number;
    rules: EmbeddedExamRulePayload[];
}
export interface EmbeddedExamConfigPayload {
    title: string;
    totalScore: number;
    matrixId?: string;
    adHocSections?: EmbeddedExamSectionPayload[];
}
export interface CreateCoursePayload {
    title: string;
    price: number;
    description?: string;
    teacherId: string;
    subjectId?: string;
    progressionMode?: ProgressionMode;
    isStrictExam?: boolean;
}
export interface UpdateCoursePayload {
    courseId: string;
    teacherId: string;
    title?: string;
    price?: number;
    discountPrice?: number;
    description?: string;
    benefits?: string[];
    requirements?: string[];
    coverImageId?: string | null;
    promotionalVideoId?: string | null;
    progressionMode?: ProgressionMode;
    isStrictExam?: boolean;
}
export interface ExamRuleConfigPayload {
    timeLimit: number;
    maxAttempts: number;
    passPercentage: number;
    showResultMode: string;
}
export type CreateSectionPayload = {
    courseId: string;
    teacherId: string;
    title: string;
    description?: string;
};
export type CreateLessonPayload = {
    courseId: string;
    sectionId: string;
    teacherId: string;
    title: string;
    isFreePreview: boolean;
    primaryVideoId?: string;
    attachments?: string[];
    content: string;
    examRules?: ExamRuleConfigPayload;
    examId?: string;
    embeddedExamConfig?: EmbeddedExamConfigPayload;
};
export type UpdateSectionPayload = {
    courseId: string;
    sectionId: string;
    teacherId: string;
    title?: string;
    description?: string;
};
export type UpdateLessonPayload = {
    courseId: string;
    lessonId: string;
    teacherId: string;
    title?: string;
    isFreePreview?: boolean;
    primaryVideoId?: string | null;
    attachments?: string[];
    content?: string;
    examRules?: ExamRuleConfigPayload;
    examId?: string | null;
    embeddedExamConfig?: EmbeddedExamConfigPayload | null;
};
export type ReorderPayload = {
    courseId: string;
    teacherId: string;
    sections?: {
        id: string;
        order: number;
    }[];
    lessons?: {
        id: string;
        order: number;
        sectionId: string;
    }[];
};
export interface CourseCheckoutPayload {
    userId: string;
    courseId: string;
}
export interface CreateEnrollmentPayload {
    userId: string;
    courseId: string;
}
export interface CreateCourseReviewPayload {
    courseId: string;
    userId: string;
    rating: number;
    comment?: string;
}
export interface ValidateCourseSubmissionPayload {
    courseId: string | Types.ObjectId;
    teacherId: string | Types.ObjectId;
    price: number;
}
export interface SubscriptionConstraintResult {
    isAllowed: boolean;
    reason?: string;
}
export interface ReplyCourseReviewPayload {
    reviewId: string;
    courseId: string;
    teacherId: string;
    reply: string;
}
export interface GetCourseReviewsPayload {
    courseId: string;
    page: number;
    limit: number;
}
