import { z } from 'zod';

export const ClassMemberStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export type ClassMemberStatus = z.infer<typeof ClassMemberStatusEnum>;

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}


export interface ClassEntity {
  id: string;
  name: string;
  code?: string; 
  description: string | null;
  isPublic: boolean;
  teacherId: string;
  createdAt: string;
}

export interface ClassMemberEntity {
  id: string;
  classId: string;
  studentId: string;
  status: ClassMemberStatus;
  joinedAt: string;
  student: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
}


export const CreateClassSchema = z.object({
  name: z.string().min(3, 'Tên lớp phải có ít nhất 3 ký tự').max(100),
  description: z.string().optional(),
  isPublic: z.boolean().default(true),
});
export type CreateClassDTO = z.infer<typeof CreateClassSchema>;

export const JoinClassByCodeSchema = z.object({
  code: z.string()
    .trim()
    .toUpperCase()
    .min(5, 'Mã lớp không hợp lệ')
    .max(10, 'Mã lớp không hợp lệ'),
});
export type JoinClassByCodeDTO = z.infer<typeof JoinClassByCodeSchema>;

export const ReviewMemberSchema = z.object({
  studentId: z.string().uuid('ID học sinh không hợp lệ'),
  status: z.enum(['APPROVED', 'REJECTED']),
});
export type ReviewMemberDTO = z.infer<typeof ReviewMemberSchema>;

export interface SearchClassParams {
  keyword?: string;
  page?: number;
  limit?: number;
}