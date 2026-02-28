import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { classService, classKeys } from '../api/class.service';
import { ROUTES } from '@/config/routes';

export const useClassPreview = (classId: string) => {
  const router = useRouter();

  const query = useQuery({
    queryKey: classKeys.detail(classId),
    queryFn: () => classService.previewClass(classId),
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false;
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (query.isError) {
      const error = query.error as any;
      if (error?.status === 404) {
        toast.error('Lớp học không tồn tại hoặc đã bị xóa.');
        router.replace(ROUTES.STUDENT.DASHBOARD); 
      }
    }
  }, [query.isError, query.error, router]);

  return query;
};