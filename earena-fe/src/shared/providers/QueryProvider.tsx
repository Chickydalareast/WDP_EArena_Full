'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '../lib/error-parser';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
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