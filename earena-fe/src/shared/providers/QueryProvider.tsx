'use client';

import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { ApiError } from '../lib/error-parser';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error) => {
            const apiError = error as unknown as ApiError;
            
            if (apiError?.statusCode === 401) return;

            if (apiError?.statusCode === 429) return;

            const errorMessage = apiError?.message || 'Đã có lỗi không xác định xảy ra. Vui lòng thử lại sau.';
            toast.error(errorMessage);
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 15,  
            refetchOnWindowFocus: false, 
            retry: (failureCount, error: unknown) => {
              const apiError = error as ApiError;
              const status = apiError?.statusCode || (error as any)?.response?.status;

              if (status && status >= 400 && status < 500) {
                return false;
              }

              return failureCount < 2;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), 
          },
          mutations: {
            retry: 0, 
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}