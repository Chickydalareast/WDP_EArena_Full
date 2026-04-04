export interface ExamResultResponse {
    status: 'GRADING_IN_PROGRESS' | 'COMPLETED';
    message?: string;
    retryAfter?: number;
    summary?: {
        score: number;
        totalQuestions: number;
        correctCount: number;
        incorrectCount: number;
        submittedAt: string;
        attemptNumber: number;
    };
    details?: unknown[];
}
export declare const useStartExam: () => any;
export declare const useAutoSave: (submissionId: string | null) => any;
export declare const useSubmitExam: (submissionId: string | null) => any;
export declare const useExamResultPolling: (submissionId: string | null, isEnabled: boolean) => any;
export declare const useExamReview: (submissionId: string) => any;
