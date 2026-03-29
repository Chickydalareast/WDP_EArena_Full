'use client';

import { useQuery } from '@tanstack/react-query';
import { enrollmentService } from '../api/enrollment.service';

export const useMyCourses = (page: number, limit: number = 10) => {
  return useQuery({
    queryKey: ['my-learning', page, limit],
    queryFn: () => enrollmentService.getMyLearning(page, limit),
    staleTime: 1000 * 60 * 5,
  });
};