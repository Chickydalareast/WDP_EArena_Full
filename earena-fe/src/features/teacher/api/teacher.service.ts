'use client';

import { axiosClient } from '@/shared/lib/axios-client';
import type { Qualification, TeacherVerificationStatus } from '@/features/admin/types/admin.types';

export const teacherService = {
  getQualifications: async (): Promise<{
    qualifications: Qualification[];
    hasUploadedQualifications: boolean;
    verificationStatus: TeacherVerificationStatus;
  }> => {
    const res = await axiosClient.get('/teachers/qualifications');
    return res.data?.data || res;
  },

  uploadQualification: async (payload: { url: string; name: string }): Promise<{
    qualifications: Qualification[];
    hasUploadedQualifications: boolean;
  }> => {
    const res = await axiosClient.post('/teachers/qualifications', payload);
    return res.data?.data || res;
  },

  deleteQualification: async (index: number): Promise<{
    qualifications: Qualification[];
    hasUploadedQualifications: boolean;
  }> => {
    const res = await axiosClient.delete(`/teachers/qualifications/${index}`);
    return res.data?.data || res;
  },

  submitForVerification: async (): Promise<{ message: string }> => {
    const res = await axiosClient.post('/teachers/qualifications/submit-review');
    return res.data || res;
  },
};
