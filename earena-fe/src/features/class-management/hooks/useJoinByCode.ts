import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { classService, classKeys } from '../api/class.service';
import { JoinClassByCodeDTO } from '../types/class.schema';
import { ROUTES } from '@/config/routes';

export const useJoinByCode = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: JoinClassByCodeDTO) => classService.joinByCode(data),
    
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      
      toast.success('Tham gia lớp học thành công!');
      
      if (response.classId) {
        router.push(ROUTES.STUDENT.DASHBOARD); 
      }
    },
    
    onError: (error: any) => {
      const status = error?.status;
      
      switch (status) {
        case 404:
          toast.error('Mã code sai. Vui lòng kiểm tra lại!');
          break;
        case 403:
          toast.error('Lớp học này đã bị khóa, không thể tham gia thêm.'); 
          break;
        case 409:
          toast.error('Bạn đã là thành viên của lớp học này rồi.'); 
          break;
        default:
          toast.error(error?.message || 'Không thể tham gia lớp học lúc này.');
          break;
      }
    },
  });
};