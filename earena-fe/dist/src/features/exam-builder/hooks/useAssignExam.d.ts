export interface AssignExamPayload {
    examId: string;
    courseIds?: string[];
    startTime: string;
    endTime: string;
    timeLimit: number;
}
export declare const useAssignExam: () => any;
