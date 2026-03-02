'use client';

import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import type {
  AdminClass,
  AdminExam,
  AdminOverview,
  AdminQuestion,
  AdminUser,
  KnowledgeTopic,
  PageResult,
  Subject,
  Role,
  UserStatus,
  PricingPlan,
  PricingPlanCode,
  TeacherVerificationRow,
  TeacherVerificationStatus,
  BusinessMetrics,
} from '../types/admin.types';

export const adminService = {
  // Dashboard
  getOverview: async (): Promise<AdminOverview> => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.DASHBOARD_OVERVIEW);
  },

  // Users
  listUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
    status?: UserStatus;
  }): Promise<PageResult<AdminUser>> => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.USERS, { params });
  },
  createUser: async (payload: {
    email: string;
    fullName: string;
    password: string;
    role: Role;
    status?: UserStatus;
  }) => {
    return axiosClient.post(API_ENDPOINTS.ADMIN.USERS, payload);
  },
  updateUserRole: async (id: string, role: Role) => {
    return axiosClient.patch(API_ENDPOINTS.ADMIN.USER_ROLE(id), { role });
  },
  updateUserStatus: async (id: string, status: UserStatus) => {
    return axiosClient.patch(API_ENDPOINTS.ADMIN.USER_STATUS(id), { status });
  },
  resetUserPassword: async (id: string, newPassword?: string) => {
    return axiosClient.post(API_ENDPOINTS.ADMIN.USER_RESET_PASSWORD(id), { newPassword });
  },
  deactivateUser: async (id: string) => {
    return axiosClient.delete(API_ENDPOINTS.ADMIN.USER(id));
  },

  // Exams
  listExams: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: 'OFFICIAL' | 'PRACTICE';
    teacherId?: string;
  }): Promise<PageResult<AdminExam>> => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.EXAMS, { params });
  },
  setExamPublish: async (id: string, isPublished: boolean) => {
    return axiosClient.patch(API_ENDPOINTS.ADMIN.EXAM_PUBLISH(id), { isPublished });
  },
  deleteExam: async (id: string) => {
    return axiosClient.delete(`${API_ENDPOINTS.ADMIN.EXAMS}/${id}`);
  },

  // Classes
  listClasses: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    teacherId?: string;
  }): Promise<PageResult<AdminClass>> => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.CLASSES, { params });
  },
  setClassLocked: async (id: string, isLocked: boolean) => {
    return axiosClient.patch(API_ENDPOINTS.ADMIN.CLASS_LOCK(id), { isLocked });
  },
  deleteClass: async (id: string) => {
    return axiosClient.delete(`${API_ENDPOINTS.ADMIN.CLASSES}/${id}`);
  },

  // Questions
  listQuestions: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    ownerId?: string;
    folderId?: string;
    topicId?: string;
  }): Promise<PageResult<AdminQuestion>> => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.QUESTIONS, { params });
  },
  setQuestionArchived: async (id: string, isArchived: boolean) => {
    return axiosClient.patch(API_ENDPOINTS.ADMIN.QUESTION_ARCHIVE(id), { isArchived });
  },
  deleteQuestion: async (id: string) => {
    return axiosClient.delete(`${API_ENDPOINTS.ADMIN.QUESTIONS}/${id}`);
  },

  // Taxonomy
  listSubjects: async (): Promise<Subject[]> => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.SUBJECTS);
  },
  createSubject: async (payload: { name: string; code: string; isActive?: boolean }) => {
    return axiosClient.post(API_ENDPOINTS.ADMIN.SUBJECTS, payload);
  },
  updateSubject: async (id: string, payload: Partial<{ name: string; code: string; isActive: boolean }>) => {
    return axiosClient.patch(API_ENDPOINTS.ADMIN.SUBJECT(id), payload);
  },
  listTopicsBySubject: async (subjectId: string): Promise<KnowledgeTopic[]> => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.SUBJECT_TOPICS(subjectId));
  },
  createTopic: async (payload: { subjectId: string; name: string; level: number; parentId?: string }) => {
    return axiosClient.post(API_ENDPOINTS.ADMIN.TOPICS, payload);
  },
  updateTopic: async (id: string, payload: Partial<{ name: string; level: number; parentId: string | null }>) => {
    return axiosClient.patch(API_ENDPOINTS.ADMIN.TOPIC(id), payload);
  },
  deleteTopic: async (id: string) => {
    return axiosClient.delete(API_ENDPOINTS.ADMIN.TOPIC(id));
  },

  // Pricing Plans
  listPricingPlans: async (): Promise<PricingPlan[]> => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.PRICING_PLANS);
  },
  createPricingPlan: async (payload: {
    name: string;
    code: PricingPlanCode;
    priceMonthly: number;
    priceYearly: number;
    benefits?: string[];
    isActive?: boolean;
  }) => {
    return axiosClient.post(API_ENDPOINTS.ADMIN.PRICING_PLANS, payload);
  },
  updatePricingPlan: async (id: string, payload: Partial<{
    name: string;
    priceMonthly: number;
    priceYearly: number;
    benefits: string[];
    isActive: boolean;
  }>) => {
    return axiosClient.patch(API_ENDPOINTS.ADMIN.PRICING_PLAN(id), payload);
  },

  // Teacher Verification
  listTeacherVerifications: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: TeacherVerificationStatus;
  }): Promise<PageResult<TeacherVerificationRow>> => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.TEACHER_VERIFICATION, { params });
  },
  updateTeacherVerification: async (id: string, payload: { status: TeacherVerificationStatus; note?: string }) => {
    return axiosClient.patch(API_ENDPOINTS.ADMIN.TEACHER_VERIFICATION_UPDATE(id), payload);
  },

  // Business Dashboard
  getBusinessMetrics: async (params?: { from?: string; to?: string }): Promise<BusinessMetrics> => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.BUSINESS_METRICS, { params });
  },

};
