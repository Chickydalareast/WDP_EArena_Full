export declare const QUESTION_TASKS_QUEUE = "question-tasks";
export interface AutoTagJobPayload {
    teacherId: string;
    questionIds: string[];
    subjectId: string;
}
export interface IAiTaggedQuestion {
    id: string;
    topicId: string | null;
    difficultyLevel: 'NB' | 'TH' | 'VD' | 'VDC' | 'UNKNOWN';
    tags: string[];
}
export interface IAiTaggingResult {
    taggedQuestions: IAiTaggedQuestion[];
}
