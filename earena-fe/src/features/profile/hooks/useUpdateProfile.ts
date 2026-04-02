import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { profileService, UpdateProfilePayload } from '../api/profile.service';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { authKeys } from '@/features/auth/api/auth.service';

type MutateParams = {
  payload: UpdateProfilePayload;
  avatarFile: File | null;
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async ({ payload, avatarFile }: MutateParams) => {
      let finalPayload = { ...payload };

      if (avatarFile) {
        const uploadedUrl = await profileService.uploadAvatar(avatarFile);
        finalPayload.avatar = uploadedUrl;
      }

      return profileService.updateProfile(finalPayload);
    },

    onMutate: async ({ payload }) => {
      await queryClient.cancelQueries({ queryKey: authKeys.session() });

      const previousUser = queryClient.getQueryData(authKeys.session());

      if (user) {
        const optimisticUser = { ...user, ...payload };
        queryClient.setQueryData(authKeys.session(), optimisticUser);
        setAuth(optimisticUser);
      }

      return { previousUser };
    },

   onError: (err: any, variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(authKeys.session(), context.previousUser);
        setAuth(context.previousUser as any);
      }
      
      let errorMsg = 'Có lỗi xảy ra, vui lòng thử lại';
      if (err?.message) {
        errorMsg = Array.isArray(err.message) ? err.message[0] : String(err.message);
      }

      toast.error('Cập nhật thất bại', { description: errorMsg });
    },
    
    onSuccess: () => {
      toast.success('Cập nhật hồ sơ thành công!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
};