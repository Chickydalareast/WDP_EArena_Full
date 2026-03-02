import { useQuery } from '@tanstack/react-query';
import { classService, classKeys } from '../api/class.service';

export const useTeacherClasses = () => {
  return useQuery({
    queryKey: classKeys.lists(), 
    queryFn: () => classService.getMyClasses(),
    staleTime: 1000 * 60 * 5, 
  });
};