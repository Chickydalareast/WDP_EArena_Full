import { axiosClient } from '@/shared/lib/axios-client';


export interface InitExamDTO {
  title: string;
  description?: string;
  subjectId: string; // ID môn học (24-char ObjectId)
}
export interface InitExamResponse {
  examId: string;  // Dùng để gắn vào lớp học sau này
  paperId: string; // Dùng để thao tác thêm/bớt câu hỏi ở Step 2
}
export interface UpdatePaperDTO {
  action: 'ADD' | 'REMOVE'; // Enum bắt buộc theo đặc tả BE
  questionId: string;       // ID câu hỏi từ Ngân hàng (24-char ObjectId)
}


export const examBuilderService = {
  initExam: async (data: InitExamDTO): Promise<InitExamResponse> => {
    return axiosClient.post('/exams/manual/init', data);
  },

  updatePaperQuestions: async (paperId: string, data: UpdatePaperDTO): Promise<void> => {
    return axiosClient.patch(`/exams/manual/papers/${paperId}/questions`, data);
  }
};