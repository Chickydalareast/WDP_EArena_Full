import { z } from 'zod';

export interface StartExamPayload {
    courseId: string;
    lessonId: string;
}

export interface StartExamResponse {
    message: string;
    submissionId: string;
    examPaperId: string;
    timeLimit: number;
    startedAt: string;
}

export interface StudentExamAnswerOption {
    id: string;
    content: string;
}

export interface StudentExamQuestion {
    originalQuestionId: string;
    type: 'MULTIPLE_CHOICE' | 'PASSAGE' | 'MIXED';
    parentPassageId: string | null;
    orderIndex: number;
    content: string;
    difficultyLevel: string;
    answers: StudentExamAnswerOption[];
    attachedMedia: string[];
    points: number | null;
    selectedAnswerId: string | null;
}

export interface ExamPaperResponse {
    submissionId: string;
    examId: string;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
    timeLimit: number;
    startedAt: string;
    questions: StudentExamQuestion[];
}