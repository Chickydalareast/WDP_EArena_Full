import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { classService, classKeys } from '../api/class.service';

export const useRequestJoin = (classId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => classService.requestJoin(classId),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.detail(classId) });
      
      toast.success('Đã gửi yêu cầu tham gia. Vui lòng chờ Giáo viên duyệt.');
    },
    
    onError: (error: any) => {
      const status = error?.status;
      
      if (status === 409) {
        toast.error('Bạn đã gửi yêu cầu rồi. Đang chờ Giáo viên phê duyệt.');
      } else {
        toast.error(error?.message || 'Có lỗi xảy ra khi gửi yêu cầu tham gia.');
      }
    },
  });
};