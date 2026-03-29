'use client';

import { useQuery } from '@tanstack/react-query';
import { authService, authKeys } from '../api/auth.service';

export const useSession = () => {
  const query = useQuery({
    queryKey: authKeys.session(),
    queryFn: authService.getProfile,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    retry: false,
  });

  return {
    ...query,
    user: query.data || null,
    isAuthenticated: !!query.data,
  };
};