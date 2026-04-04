import { EditQuestionFormDTO } from '../types/exam.schema';
export interface PopulatedMedia {
    _id: string;
    url: string;
    mimetype: string;
    originalName: string;
}
export interface PopulatedAnswer {
    id: string;
    content: string;
    isCorrect?: boolean;
}
export interface PopulatedSubQuestion {
    _id: string;
    originalQuestionId: string;
    content: string;
    explanation?: string;
    difficultyLevel?: 'NB' | 'TH' | 'VD' | 'VDC' | 'UNKNOWN';
    attachedMedia?: PopulatedMedia[];
    answers?: PopulatedAnswer[];
}
export interface PopulatedQuestion {
    _id: string;
    originalQuestionId: string;
    type: 'MULTIPLE_CHOICE' | 'PASSAGE';
    content: string;
    explanation?: string;
    topicId?: string;
    tags?: string[];
    isDraft?: boolean;
    difficultyLevel?: 'NB' | 'TH' | 'VD' | 'VDC' | 'UNKNOWN';
    attachedMedia?: PopulatedMedia[];
    answers?: PopulatedAnswer[];
    subQuestions?: PopulatedSubQuestion[];
}
export interface AnswerKey {
    originalQuestionId: string;
    correctAnswerId: string;
}
export declare const hydrateQuestionForEdit: (question: PopulatedQuestion, answerKeys?: AnswerKey[]) => EditQuestionFormDTO;
