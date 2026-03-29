import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import type { 
  InitExamDTO, 
  InitExamResponse, 
  UpdatePaperDTO, 
  GenerateExamDTO, 
  PublishExamResponse, 
  GenerateExamResponse,
  QuestionItemDTO,
  UpdateSingleQuestionDTO,
  UpdatePassageDTO
} from '../types/exam.schema';

export const examBuilderService = {
  // 1. Khởi tạo Đề thi Tĩnh (Đã bỏ duration ở type)
  initExam: async (data: InitExamDTO): Promise<InitExamResponse> => {
    return axiosClient.post(API_ENDPOINTS.EXAMS.MANUAL_INIT, data); // [cite: 74]
  },

  // 2. Cập nhật Thông tin Đề thi (Title, Description, TotalScore)
  updateExamInfo: async (examId: string, data: Partial<InitExamDTO>): Promise<void> => {
    return axiosClient.patch(`${API_ENDPOINTS.EXAMS.BASE}/${examId}`, data); // [cite: 125, 128]
  },

  // 3. Xóa Đề thi (Chỉ xóa được khi isPublished: false)
  deleteExam: async (examId: string): Promise<void> => {
    return axiosClient.delete(`${API_ENDPOINTS.EXAMS.BASE}/${examId}`); // [cite: 131]
  },

  // 4. Sinh Đề thi Động từ Ma trận
  generateExam: async (data: GenerateExamDTO): Promise<GenerateExamResponse> => {
    return axiosClient.post(API_ENDPOINTS.EXAMS.GENERATE, data); // [cite: 90]
  },

  // 5. Lấy chi tiết Giấy nháp (Kèm answerKeys)
  getPaperPreview: async (paperId: string): Promise<unknown> => { 
    return axiosClient.get(API_ENDPOINTS.EXAMS.PAPER_PREVIEW(paperId)); // [cite: 117]
  },

  // 6. Cập nhật Nội dung Đề thi (Add / Remove / Reorder)
  updatePaperQuestions: async (paperId: string, data: UpdatePaperDTO): Promise<void> => {
    return axiosClient.patch(API_ENDPOINTS.EXAMS.PAPER_QUESTIONS(paperId), data); // [cite: 103]
  },

  // 7. Chốt đề thi (Khóa câu hỏi)
  publishExam: async (examId: string): Promise<PublishExamResponse> => {
    return axiosClient.post(API_ENDPOINTS.EXAMS.PUBLISH(examId)); // [cite: 136]
  },

  // 8. Lấy Bảng xếp hạng (Chuyển sang context của Khóa học)
  getLeaderboard: async (courseId: string, lessonId: string, params?: any): Promise<unknown> => {
    return axiosClient.get(`/exams/leaderboard/courses/${courseId}/lessons/${lessonId}`, { params }); // [cite: 153]
  },

  // --- Các hàm Question Bank giữ nguyên ---
  bulkCreateQuestionsAndReturnIds: async (data: { folderId: string; questions: QuestionItemDTO[] }): Promise<unknown> => {
    return axiosClient.post(API_ENDPOINTS.QUESTIONS.BULK_CREATE, data);
  },
  deleteQuestion: async (questionId: string): Promise<void> => {
    return axiosClient.delete(API_ENDPOINTS.QUESTIONS.DETAIL(questionId));
  },
  updateSingleQuestion: async (questionId: string, payload: UpdateSingleQuestionDTO): Promise<void> => {
    return axiosClient.patch(API_ENDPOINTS.QUESTIONS.DETAIL(questionId), payload);
  },
  updatePassageQuestion: async (passageId: string, payload: UpdatePassageDTO): Promise<void> => {
    return axiosClient.put(API_ENDPOINTS.QUESTIONS.PASSAGE(passageId), payload);
  }
};