import { ExamHistoryOverview, ExamAttemptDetail } from '../types/exam-history.schema';
export declare const examHistoryKeys: {
    all: readonly ["exam-history"];
    overview: () => readonly ["exam-history", "overview"];
    lesson: (lessonId: string) => readonly ["exam-history", "lesson", string];
};
export declare const examHistoryService: {
    getOverview: () => Promise<ExamHistoryOverview[]>;
    getLessonAttempts: (lessonId: string) => Promise<ExamAttemptDetail[]>;
};
