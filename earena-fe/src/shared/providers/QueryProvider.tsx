'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 phút data mới bị coi là cũ.
            gcTime: 1000 * 60 * 15,   // 15 phút dọn rác bộ nhớ.
            retry: (failureCount, error: any) => {
              // Tuyệt đối KHÔNG retry nếu client gửi sai format (4xx)
              if (error?.status >= 400 && error?.status < 500) return false;
              // Retry tối đa 3 lần nếu máy chủ lag (5xx) hoặc rớt mạng
              return failureCount < 3;
            },
            refetchOnWindowFocus: false, // Tắt ngay lập tức. Tính năng này trên nền tảng thi cử sẽ làm sập Server khi hàng ngàn học sinh switch tab qua lại.
          },
          mutations: {
            retry: 1, // Mutate (Gửi bài/Lưu nháp) chỉ retry 1 lần để tránh double transaction.
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