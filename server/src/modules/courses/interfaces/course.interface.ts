import { Types } from "mongoose";
import { ProgressionMode } from "../enums/progression-mode.enum"; // Nhớ import Enum này

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
  examId?: string;
  content: string;
  examRules?: ExamRuleConfigPayload;
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
  examId?: string | null;
  content?: string;
  examRules?: ExamRuleConfigPayload;
};

export type ReorderPayload = {
  courseId: string;
  teacherId: string;
  sections?: { id: string; order: number }[];
  lessons?: { id: string; order: number; sectionId: string }[];
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