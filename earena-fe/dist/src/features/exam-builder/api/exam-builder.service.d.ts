import type { InitExamDTO, InitExamResponse, UpdatePaperDTO, GenerateExamDTO, PublishExamResponse, GenerateExamResponse, QuestionItemDTO, UpdateSingleQuestionDTO, UpdatePassageDTO, UpdatePointsDTO, FillFromMatrixResponse, FillFromMatrixDTO, MatrixTemplate, PaginatedMatrixResponse, ActiveFiltersResponse, ActiveFiltersPayloadDTO, PreviewMatrixRuleResponse, MatrixRuleDTO, DynamicPreviewRequestDTO, DynamicPreviewResponse } from '../types/exam.schema';
import { AxiosRequestConfig } from 'axios';
export declare const examBuilderService: {
    initExam: (data: InitExamDTO) => Promise<InitExamResponse>;
    updateExamInfo: (examId: string, data: Partial<InitExamDTO>) => Promise<void>;
    deleteExam: (examId: string) => Promise<void>;
    generateExam: (data: GenerateExamDTO) => Promise<GenerateExamResponse>;
    getPaperPreview: (paperId: string) => Promise<unknown>;
    updatePaperQuestions: (paperId: string, data: UpdatePaperDTO) => Promise<void>;
    publishExam: (examId: string) => Promise<PublishExamResponse>;
    getLeaderboard: (courseId: string, lessonId: string, params?: any) => Promise<unknown>;
    bulkCreateQuestionsAndReturnIds: (data: {
        folderId: string;
        questions: QuestionItemDTO[];
    }) => Promise<unknown>;
    deleteQuestion: (questionId: string) => Promise<void>;
    updateSingleQuestion: (questionId: string, payload: UpdateSingleQuestionDTO) => Promise<void>;
    updatePassageQuestion: (passageId: string, payload: UpdatePassageDTO) => Promise<void>;
    getMatrices: (params?: Record<string, unknown>) => Promise<PaginatedMatrixResponse>;
    getMatrixDetail: (matrixId: string) => Promise<MatrixTemplate>;
    fillFromMatrix: (paperId: string, data: FillFromMatrixDTO) => Promise<FillFromMatrixResponse>;
    updatePoints: (paperId: string, data: UpdatePointsDTO) => Promise<void>;
    getActiveFilters: (payload: ActiveFiltersPayloadDTO, config?: AxiosRequestConfig) => Promise<ActiveFiltersResponse>;
    previewMatrixRule: (paperId: string, payload: MatrixRuleDTO, config?: AxiosRequestConfig) => Promise<PreviewMatrixRuleResponse>;
    previewDynamicExam: (payload: DynamicPreviewRequestDTO) => Promise<DynamicPreviewResponse>;
};
