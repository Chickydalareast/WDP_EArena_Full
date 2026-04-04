import { PopulatedQuestion, AnswerKey } from '@/features/exam-builder/lib/hydration-utils';
import { MatrixSectionDTO } from '@/features/exam-builder/types/exam.schema';

export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

export interface AdminOverview {
  users: { total: number; students: number; teachers: number; admins: number };
  exams: { total: number; published: number };
  questions: { total: number; archived: number };
  classes: { total: number; locked: number };
  courses: {
    total: number;
    pending: number;
    published: number;
    rejected: number;
  };
}

export interface PageMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PageResult<T> {
  items: T[];
  meta: PageMeta;
}

export interface AdminUser {
  _id: string;
  email: string;
  fullName: string;
  role: Role;
  status: UserStatus;
  avatar?: string;
  phone?: string;
  createdAt?: string;
}

export interface AdminExam {
  _id: string;
  title: string;
  description?: string;
  teacherId: string;
  duration: number;
  totalScore: number;
  isPublished: boolean;
  type: 'OFFICIAL' | 'PRACTICE';
  createdAt?: string;
}

export interface AdminClass {
  _id: string;
  name: string;
  description?: string;
  code: string;
  teacherId: string;
  isLocked: boolean;
  isPublic: boolean;
  createdAt?: string;
}

export interface AdminQuestion {
  _id: string;
  ownerId: string;
  folderId: string;
  topicId: string;
  content: string;
  difficultyLevel: string;
  tags: string[];
  isArchived: boolean;
  createdAt?: string;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface KnowledgeTopic {
  _id: string;
  subjectId: string;
  name: string;
  level: number;
  parentId?: string | null;
  ancestors?: string[];
}


export type PricingPlanCode = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface PricingPlan {
  _id: string;
  name: string;
  code: PricingPlanCode;
  priceMonthly: number;
  priceYearly: number;
  benefits: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}


export interface BusinessMetrics {
  users: { total: number; teachers: number; students: number };
  revenue: { total: number; currency: string; paidOrders: number };
  note?: string;
}


export type CourseApprovalStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';

export interface AdminCourseApproval {
  id: string;
  title: string;
  slug: string;
  price: number;
  status: CourseApprovalStatus;
  teacher: {
    id: string;
    fullName: string;
    email: string;
  };
  submittedAt: string;
  createdAt: string;
}

export interface RejectCoursePayload {
  reason: string;
}

export interface ForceTakedownPayload {
  reason: string;
}

export type MasterListCourseStatus = Exclude<CourseApprovalStatus, 'DRAFT'>;

export interface AdminCourseLesson {
  id: string;
  title: string;
  order: number;
  isFreePreview: boolean;
  type: string;
  examId?: string;
  examType?: 'OFFICIAL' | 'PRACTICE' | 'COURSE_QUIZ';
  examMode?: 'STATIC' | 'DYNAMIC';
  dynamicConfig?: {
    matrixId: string | null;
    adHocSections: MatrixSectionDTO[];
  } | null;

  content?: string;
  primaryVideo?: {
    url: string;
    blurHash?: string;
  };
  attachments?: {
    id: string;
    url: string;
    originalName: string;
    size?: number;
  }[];
}

export interface AdminCourseSection {
  id: string;
  title: string;
  order: number;
  lessons: AdminCourseLesson[];
}

export interface AdminCourseDetail {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  discountPrice?: number;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';

  teacherId: string;
  teacher?: {
    id: string;
    fullName: string;
    avatar?: string;
    bio?: string | null
  };

  coverImage?: {
    id: string;
    url: string;
    blurHash?: string;
  } | null;
  promotionalVideoId?: string | null;
  subject?: { id: string; name: string };

  benefits?: string[];
  requirements?: string[];

  totalLessons?: number;
  totalVideos?: number;
  totalDocuments?: number;
  totalQuizzes?: number;

  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;

  sections: AdminCourseSection[];
}

export interface AdminDryRunQuizResponse {
  data: {
    questions: PopulatedQuestion[];
    answerKeys: AnswerKey[];
  };
  meta: {
    totalItems: number;
    totalActualQuestions: number;
  };
}

export interface AdminDynamicConfig {
  matrixId: string | null;
  adHocSections: Array<{
    name: string;
    orderIndex: number;
    rules: Array<{
      questionType: 'FLAT' | 'PASSAGE';
      limit: number;
      subQuestionLimit?: number;
      folderIds: string[];
      topicIds: string[];
      difficulties: string[];
      tags: string[];
    }>;
  }>;
}