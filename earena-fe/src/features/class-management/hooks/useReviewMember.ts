import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { classService, classKeys } from '../api/class.service';
import { ClassMemberEntity, ClassMemberStatus, ReviewMemberDTO } from '../types/class.schema';

export const useReviewMember = (classId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReviewMemberDTO) => classService.reviewMember(classId, data),
    
    onMutate: async (newReview) => {
      const pendingKey = classKeys.members(classId, 'PENDING');
      await queryClient.cancelQueries({ queryKey: pendingKey });

      const previousPending = queryClient.getQueryData<ClassMemberEntity[]>(pendingKey);

      if (previousPending) {
        queryClient.setQueryData<ClassMemberEntity[]>(
          pendingKey,
          old => old?.filter(member => member.studentId !== newReview.studentId) ?? []
        );
      }

      return { previousPending, pendingKey };
    },

    onError: (err, newReview, context) => {
      if (context?.previousPending) {
        queryClient.setQueryData(context.pendingKey, context.previousPending);
      }
      toast.error('Có lỗi xảy ra, không thể cập nhật trạng thái học sinh.');
    },

    onSuccess: (_, variables) => {
      const action = variables.status === 'APPROVED' ? 'Duyệt' : 'Từ chối';
      toast.success(`Đã ${action} học sinh thành công.`);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.members(classId, 'PENDING') });
      queryClient.invalidateQueries({ queryKey: classKeys.members(classId, 'APPROVED') });
    },
  });
};