import { axiosClient } from '@/shared/lib/axios-client';

export type UpdateProfilePayload = {
  fullName?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string | Date;
};

export const profileService = {
  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', 'avatar'); 

    const response = await axiosClient.post('/media/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.url || response.url; 
  },

  updateProfile: async (payload: UpdateProfilePayload) => {
    return axiosClient.patch('/users/me/profile', payload);
  },
};