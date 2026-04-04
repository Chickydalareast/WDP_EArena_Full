interface FetchQuestionsParams {
    page?: number;
    limit?: number;
    topicId?: string;
    difficultyLevel?: string;
}
export declare const useQuestions: (params?: FetchQuestionsParams) => any;
export {};
