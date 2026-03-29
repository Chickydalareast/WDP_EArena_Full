import { useMutation } from '@tanstack/react-query';
import { courseService } from '@/features/courses/api/course.service';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/config/routes';
import { toast } from 'sonner';
import { parseApiError } from '@/shared/lib/error-parser';

export const useCheckoutFlow = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const { mutate: enroll, isPending } = useMutation({
    mutationFn: (courseId: string) => courseService.enrollCourse(courseId),
    onSuccess: (_, courseId) => {
      toast.success('Ghi danh thành công!', { 
        description: 'Thanh toán hoàn tất. Chào mừng bạn đến với khóa học.' 
      });
      router.push(ROUTES.STUDENT.STUDY_ROOM(courseId));
    },
    onError: (error) => {
      toast.error('Lỗi thanh toán', { description: parseApiError(error).message });
    }
  });

  const handleCheckout = (courseId: string, price: number) => {
    if (!user) {
      router.push(`${ROUTES.AUTH.LOGIN}?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (user.balance < price) {
      toast.error('Số dư ví không đủ', {
        description: `Khóa học có giá ${price.toLocaleString('vi-VN')} VNĐ nhưng ví của bạn chỉ còn ${user.balance.toLocaleString('vi-VN')} VNĐ.`,
        action: {
          label: 'Nạp tiền ngay',
          onClick: () => router.push(ROUTES.STUDENT.WALLET)
        },
        duration: 5000,
      });
      return;
    }

    enroll(courseId);
  };

  return { handleCheckout, isProcessing: isPending };
};