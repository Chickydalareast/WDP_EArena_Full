import { axiosClient } from '@/shared/lib/axios-client';
import { uploadImageDirectToCloudinary } from '@/shared/lib/cloudinary-direct-image-upload';

export type UpdateProfilePayload = {
  fullName?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string | Date;
};

export const profileService = {
  uploadAvatar: async (file: File): Promise<string> => {
    const { url } = await uploadImageDirectToCloudinary(file, 'avatar');
    return url;
  },

  updateProfile: async (payload: UpdateProfilePayload) => {
    return axiosClient.patch('/users/me/profile', payload);
  },
};