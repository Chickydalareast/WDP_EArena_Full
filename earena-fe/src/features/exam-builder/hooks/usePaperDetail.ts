// src/features/exam-builder/hooks/usePaperDetail.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { examQueryKeys } from '../api/query-keys';

export const usePaperDetail = (paperId: string) => {
  return useQuery({
    // Sử dụng queryKey chuẩn từ file query-keys.ts của bạn
    queryKey: examQueryKeys.paperDetail(paperId),
    queryFn: async () => {
      // Nếu không có paperId thì không gọi API
      if (!paperId) throw new Error('Missing paperId');
      
      // Axios interceptor của bạn đã unwrap data rồi nên cứ thế return
      return axiosClient.get(API_ENDPOINTS.EXAMS.PAPER_PREVIEW(paperId));
    },
    // Chỉ kích hoạt Hook này khi có paperId hợp lệ
    enabled: !!paperId,
    staleTime: 0, // Luôn lấy data mới nhất khi màn hình focus lại
  });
};