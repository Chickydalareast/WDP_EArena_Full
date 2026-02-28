import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { classService, classKeys } from '../api/class.service';
import { CreateClassDTO } from '../types/class.schema';

export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClassDTO) => classService.createClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Không thể tạo lớp học lúc này.');
    }
  });
};