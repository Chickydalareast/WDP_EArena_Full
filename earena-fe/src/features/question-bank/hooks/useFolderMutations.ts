'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { questionBankService } from '../api/question-bank.service';
import { FolderPayloadDTO } from '../types/question-bank.schema';
import { ApiError } from '@/shared/lib/error-parser';

export const FOLDER_QUERY_KEY = ['question-folders', 'tree'];

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FolderPayloadDTO) => questionBankService.createFolder(data),
    onSuccess: () => {
      toast.success('Tạo thư mục thành công');
      queryClient.invalidateQueries({ queryKey: FOLDER_QUERY_KEY });
    },
    onError: (err: ApiError) => {
      toast.error('Lỗi tạo thư mục', { description: err.message });
    }
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FolderPayloadDTO> }) => 
      questionBankService.updateFolder(id, data),
    onSuccess: () => {
      toast.success('Cập nhật thư mục thành công');
      queryClient.invalidateQueries({ queryKey: FOLDER_QUERY_KEY });
    },
    onError: (err: ApiError) => {
      if (err.statusCode === 400) {
        toast.error('Thao tác không hợp lệ', { description: 'Không thể di chuyển thư mục vào chính nó.' });
      } else if (err.statusCode === 409) {
        toast.error('Xung đột dữ liệu', { description: 'Không thể di chuyển thư mục cha vào bên trong thư mục con của nó.' });
      } else {
        toast.error('Lỗi cập nhật', { description: err.message });
      }
    }
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => questionBankService.deleteFolder(id),
    onSuccess: () => {
      toast.success('Đã xóa thư mục');
      queryClient.invalidateQueries({ queryKey: FOLDER_QUERY_KEY });
    },
    onError: (err: ApiError) => {
      if (err.statusCode === 409) {
        toast.error('Không thể xóa thư mục!', { 
          description: 'Thư mục này đang chứa câu hỏi hoặc thư mục con. Vui lòng di chuyển hoặc xóa hết dữ liệu bên trong trước.',
          duration: 5000,
        });
      } else {
        toast.error('Lỗi khi xóa', { description: err.message });
      }
    }
  });
};