'use client';

import { useQuery } from '@tanstack/react-query';
import { taxonomyService, SubjectDTO } from '../api/taxonomy.service'; 

export const SUBJECT_QUERY_KEY = ['taxonomy', 'subjects'] as const;

export const useSubjects = () => {
  return useQuery<SubjectDTO[], Error>({
    queryKey: SUBJECT_QUERY_KEY,
    queryFn: taxonomyService.getSubjects,
    staleTime: 1000 * 60 * 60 * 24, 
    gcTime: 1000 * 60 * 60 * 24, 
    refetchOnWindowFocus: false,
  });
};