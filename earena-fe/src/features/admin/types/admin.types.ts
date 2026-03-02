export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

export interface AdminOverview {
  users: { total: number; students: number; teachers: number; admins: number };
  exams: { total: number; published: number };
  questions: { total: number; archived: number };
  classes: { total: number; locked: number };
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

export type TeacherVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface TeacherVerificationRow {
  _id: string;
  email: string;
  fullName: string;
  avatar?: string;
  phone?: string;
  teacherVerificationStatus: TeacherVerificationStatus;
  teacherVerificationNote?: string | null;
  teacherVerifiedAt?: string | null;
}

export interface BusinessMetrics {
  users: { total: number; teachers: number; students: number };
  revenue: { total: number; currency: string; paidOrders: number };
  note?: string;
}
