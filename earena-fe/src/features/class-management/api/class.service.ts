import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import {
  ClassEntity,
  ClassMemberEntity,
  ClassMemberStatus,
  CreateClassDTO,
  JoinClassByCodeDTO,
  PaginatedResponse,
  ReviewMemberDTO,
  SearchClassParams,
} from '../types/class.schema';

export const classKeys = {
  all: ['classes'] as const,
  lists: () => [...classKeys.all, 'list'] as const,
  list: (params: SearchClassParams) => [...classKeys.lists(), params] as const,
  details: () => [...classKeys.all, 'detail'] as const,
  detail: (id: string) => [...classKeys.details(), id] as const,
  members: (classId: string, status?: ClassMemberStatus) => 
    [...classKeys.detail(classId), 'members', status] as const,
};

export const classService = {
  searchClasses: async (params: SearchClassParams): Promise<PaginatedResponse<ClassEntity>> => {
    return axiosClient.get(API_ENDPOINTS.CLASSES.SEARCH, { params });
  },

  previewClass: async (classId: string): Promise<ClassEntity> => {
    return axiosClient.get(API_ENDPOINTS.CLASSES.PREVIEW(classId));
  },

  joinByCode: async (data: JoinClassByCodeDTO): Promise<{ message: string; classId: string }> => {
    return axiosClient.post(API_ENDPOINTS.CLASSES.JOIN_BY_CODE, data);
  },

  requestJoin: async (classId: string): Promise<{ message: string }> => {
    return axiosClient.post(API_ENDPOINTS.CLASSES.REQUEST_JOIN(classId));
  },

  createClass: async (data: CreateClassDTO): Promise<ClassEntity> => {
    return axiosClient.post(API_ENDPOINTS.CLASSES.BASE, data);
  },

  getMembers: async (classId: string, status?: ClassMemberStatus): Promise<ClassMemberEntity[]> => {
    return axiosClient.get(API_ENDPOINTS.CLASSES.MEMBERS(classId), {
      params: { status },
    });
  },

  reviewMember: async (classId: string, data: ReviewMemberDTO): Promise<{ message: string }> => {
    return axiosClient.patch(API_ENDPOINTS.CLASSES.REVIEW_MEMBER(classId), data);
  },

  getMyClasses: async (): Promise<ClassEntity[]> => {
    return axiosClient.get(API_ENDPOINTS.CLASSES.BASE); 
  },
};