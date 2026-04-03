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

// Teacher Verification Types
export type TeacherVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface Qualification {
  url: string;
  name: string;
  uploadedAt: string;
}

export interface AdminTeacherVerification {
  _id: string;
  email: string;
  fullName: string;
  avatar?: string;
  phone?: string;
  teacherVerificationStatus: TeacherVerificationStatus;
  teacherVerificationNote?: string;
  teacherVerifiedAt?: string;
  hasUploadedQualifications: boolean;
  qualifications?: Qualification[];
  createdAt?: string;
}