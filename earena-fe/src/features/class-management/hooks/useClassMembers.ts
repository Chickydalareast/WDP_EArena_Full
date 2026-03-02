import { useQuery } from '@tanstack/react-query';
import { classService, classKeys } from '../api/class.service';
import { ClassMemberStatus } from '../types/class.schema';

export const useClassMembers = (classId: string, status: ClassMemberStatus) => {
  return useQuery({
    queryKey: classKeys.members(classId, status),
    queryFn: () => classService.getMembers(classId, status),
    staleTime: 1000 * 30,
  });
};