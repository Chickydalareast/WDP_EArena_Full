import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { QuestionItemDTO } from '@/features/exam-builder/types/exam.schema';
import type {
    FolderNode,
    FolderPayloadDTO,
    FetchBankQuestionsParams,
    BankQuestionsResponse,
    BulkMoveQuestionsDTO,
    CloneQuestionDTO,
    BulkCloneQuestionsDTO,
    BulkDeleteQuestionsDTO,
    AiQuestionBuilderResponse,
    AiQuestionBuilderDTO,
    OrganizeQuestionsPayload,
    OrganizePreviewResponse,
    OrganizeExecuteResponse,
    BulkAutoTagDTO,
    BulkAutoTagResponse,
    BulkPublishResponse,
    BulkPublishQuestionsDTO
} from '../types/question-bank.schema';

export const questionBankService = {
    getFolderTree: async (): Promise<FolderNode[]> => {
        return axiosClient.get<unknown, FolderNode[]>(API_ENDPOINTS.QUESTION_FOLDERS.BASE);
    },

    createFolder: async (data: FolderPayloadDTO): Promise<FolderNode> => {
        return axiosClient.post<unknown, FolderNode>(API_ENDPOINTS.QUESTION_FOLDERS.BASE, data);
    },

    updateFolder: async (id: string, data: Partial<FolderPayloadDTO>): Promise<FolderNode> => {
        return axiosClient.patch<unknown, FolderNode>(API_ENDPOINTS.QUESTION_FOLDERS.DETAIL(id), data);
    },

    deleteFolder: async (id: string): Promise<void> => {
        return axiosClient.delete<unknown, void>(API_ENDPOINTS.QUESTION_FOLDERS.DETAIL(id));
    },

    getQuestionsByFolder: async (params: FetchBankQuestionsParams): Promise<BankQuestionsResponse> => {
        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                    if (value.length > 0) {
                        queryParams.append(key, value.join(','));
                    }
                } else {
                    queryParams.append(key, String(value));
                }
            }
        });

        return axiosClient.get<unknown, BankQuestionsResponse>(
            `${API_ENDPOINTS.QUESTIONS.BASE}?${queryParams.toString()}`
        );
    },

    bulkCreateQuestions: async (data: { folderId: string; questions: QuestionItemDTO[] }): Promise<void> => {
        return axiosClient.post<unknown, void>(API_ENDPOINTS.QUESTIONS.BULK_CREATE, data);
    },


    bulkMoveQuestions: async (data: BulkMoveQuestionsDTO): Promise<void> => {
        return axiosClient.patch<unknown, void>(API_ENDPOINTS.QUESTIONS.BULK_MOVE, data);
    },

    cloneQuestion: async (id: string, data: CloneQuestionDTO): Promise<void> => {
        return axiosClient.post<unknown, void>(API_ENDPOINTS.QUESTIONS.CLONE(id), data);
    },

    bulkCloneQuestions: async (data: BulkCloneQuestionsDTO): Promise<void> => {
        return axiosClient.post<unknown, void>(API_ENDPOINTS.QUESTIONS.BULK_CLONE, data);
    },

    bulkDeleteQuestions: async (data: BulkDeleteQuestionsDTO): Promise<void> => {
        return axiosClient.post<unknown, void>(API_ENDPOINTS.QUESTIONS.BULK_DELETE, data);
    },

    generateAiQuestions: async (data: AiQuestionBuilderDTO): Promise<AiQuestionBuilderResponse> => {
        const formData = new FormData();

        data.files.forEach((file) => {
            formData.append('files', file);
        });

        formData.append('folderId', data.folderId);

        if (data.additionalInstructions?.trim()) {
            formData.append('additionalInstructions', data.additionalInstructions.trim());
        }

        return axiosClient.post<unknown, AiQuestionBuilderResponse>(
            API_ENDPOINTS.QUESTIONS.AI_GENERATE,
            formData,
            {
                timeout: 180000,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
    },

    previewAutoOrganize: async (data: OrganizeQuestionsPayload): Promise<OrganizePreviewResponse> => {
        return axiosClient.post<unknown, OrganizePreviewResponse>(
            API_ENDPOINTS.QUESTIONS.ORGANIZE_PREVIEW,
            data
        );
    },

    executeAutoOrganize: async (data: OrganizeQuestionsPayload): Promise<OrganizeExecuteResponse> => {
        return axiosClient.post<unknown, OrganizeExecuteResponse>(
            API_ENDPOINTS.QUESTIONS.ORGANIZE_EXECUTE,
            data
        );
    },

    bulkAutoTag: async (data: BulkAutoTagDTO): Promise<BulkAutoTagResponse> => {
        return axiosClient.post<unknown, BulkAutoTagResponse>(
            API_ENDPOINTS.QUESTIONS.BULK_AUTO_TAG, 
            data
        );
    },

    bulkPublishQuestions: async (data: BulkPublishQuestionsDTO): Promise<BulkPublishResponse> => {
        return axiosClient.patch<unknown, BulkPublishResponse>(
            API_ENDPOINTS.QUESTIONS.BULK_PUBLISH,
            data
        );
    },
};