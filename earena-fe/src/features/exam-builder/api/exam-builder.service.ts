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
  UpdatePassageDTO,
  UpdatePointsDTO,
  FillFromMatrixResponse,
  FillFromMatrixDTO,
  MatrixTemplate,
  PaginatedMatrixResponse,
  ActiveFiltersResponse,
  ActiveFiltersPayloadDTO,
  PreviewMatrixRuleResponse,
  MatrixRuleDTO,
  DynamicPreviewRequestDTO,
  DynamicPreviewResponse
} from '../types/exam.schema';
import { AxiosRequestConfig } from 'axios';

export const examBuilderService = {
  initExam: async (data: InitExamDTO): Promise<InitExamResponse> => {
    return axiosClient.post(API_ENDPOINTS.EXAMS.MANUAL_INIT, data);
  },

  updateExamInfo: async (examId: string, data: Partial<InitExamDTO>): Promise<void> => {
    return axiosClient.patch(`${API_ENDPOINTS.EXAMS.BASE}/${examId}`, data);
  },

  deleteExam: async (examId: string): Promise<void> => {
    return axiosClient.delete(`${API_ENDPOINTS.EXAMS.BASE}/${examId}`);
  },

  generateExam: async (data: GenerateExamDTO): Promise<GenerateExamResponse> => {
    return axiosClient.post(API_ENDPOINTS.EXAMS.GENERATE, data);
  },

  getPaperPreview: async (paperId: string): Promise<unknown> => {
    return axiosClient.get(API_ENDPOINTS.EXAMS.PAPER_PREVIEW(paperId));
  },

  updatePaperQuestions: async (paperId: string, data: UpdatePaperDTO): Promise<void> => {
    return axiosClient.patch(API_ENDPOINTS.EXAMS.PAPER_QUESTIONS(paperId), data);
  },

  publishExam: async (examId: string): Promise<PublishExamResponse> => {
    return axiosClient.post(API_ENDPOINTS.EXAMS.PUBLISH(examId));
  },

  getLeaderboard: async (courseId: string, lessonId: string, params?: any): Promise<unknown> => {
    return axiosClient.get(`/exams/leaderboard/courses/${courseId}/lessons/${lessonId}`, { params });
  },

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
  },

  getMatrices: async (params?: Record<string, unknown>): Promise<PaginatedMatrixResponse> => {
    return axiosClient.get(API_ENDPOINTS.EXAM_MATRICES.BASE, { params });
  },

  getMatrixDetail: async (matrixId: string): Promise<MatrixTemplate> => {
    return axiosClient.get(API_ENDPOINTS.EXAM_MATRICES.DETAIL(matrixId));
  },

  fillFromMatrix: async (paperId: string, data: FillFromMatrixDTO): Promise<FillFromMatrixResponse> => {
    return axiosClient.post(API_ENDPOINTS.EXAMS.FILL_FROM_MATRIX(paperId), data, {
      timeout: 30000
    });
  },

  updatePoints: async (paperId: string, data: UpdatePointsDTO): Promise<void> => {
    return axiosClient.patch(API_ENDPOINTS.EXAMS.UPDATE_POINTS(paperId), data);
  },

  getActiveFilters: async (payload: ActiveFiltersPayloadDTO, config?: AxiosRequestConfig): Promise<ActiveFiltersResponse> => {
    return axiosClient.post(API_ENDPOINTS.QUESTIONS.ACTIVE_FILTERS, payload, config);
  },

  previewMatrixRule: async (paperId: string, payload: MatrixRuleDTO, config?: AxiosRequestConfig): Promise<PreviewMatrixRuleResponse> => {
    return axiosClient.post(API_ENDPOINTS.EXAMS.PREVIEW_MATRIX_RULE(paperId), payload, config);
  },

  previewDynamicExam: async (payload: DynamicPreviewRequestDTO): Promise<DynamicPreviewResponse> => {
    return axiosClient.post<unknown, DynamicPreviewResponse>(
      API_ENDPOINTS.EXAMS.DYNAMIC_PREVIEW, 
      payload
    );
  },
};