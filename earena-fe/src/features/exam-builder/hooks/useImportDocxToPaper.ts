'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { examBuilderService } from '../api/exam-builder.service';
import { examQueryKeys } from '../api/query-keys';

interface ImportDocxPayload {
  fileName: string;
}

export const useImportDocxToPaper = (paperId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileName, questions }: ImportDocxPayload) => {
      if (questions.length === 0) throw new Error('File Word không chứa câu hỏi nào hợp lệ.');

      const folderResponse = await axiosClient.post<any, any>(API_ENDPOINTS.FOLDERS.BASE, {
        name: `[Tài nguyên Import] ${fileName}`,
        parentId: null
      });
      const folderId = folderResponse.id || folderResponse._id;

      const bulkResponse = await axiosClient.post<any, any>(API_ENDPOINTS.QUESTIONS.BULK_IMPORT, {
        folderId: folderId,
        questions: questions
      });

      const createdIds: string[] = bulkResponse.map((q: any) => q.id || q._id);

      const addPromises = createdIds.map(id => 
        examBuilderService.updatePaperQuestions(paperId, {
          action: 'ADD',
          questionId: id
        })
      );
      await Promise.all(addPromises);

      return createdIds.length;
    },
    onSuccess: (count) => {
      toast.success(`Import thành công ${count} câu hỏi vào đề!`);
      queryClient.invalidateQueries({ queryKey: examQueryKeys.paperDetail(paperId) });
    },
    onError: (error: any) => {
      toast.error('Import thất bại', { description: error.message });
    }
  });
};