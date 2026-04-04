import { DifficultyLevel, QuestionType } from '../schemas/question.schema';
export interface AiGeneratedAnswer {
    id: string;
    content: string;
    isCorrect: boolean;
}
export interface AiGeneratedSubQuestion {
    content: string;
    explanation?: string;
    difficultyLevel?: DifficultyLevel;
    answers: AiGeneratedAnswer[];
}
export interface AiGeneratedQuestion {
    type: QuestionType;
    content: string;
    explanation?: string;
    difficultyLevel?: DifficultyLevel;
    topicId?: string;
    tags?: string[];
    answers?: AiGeneratedAnswer[];
    subQuestions?: AiGeneratedSubQuestion[];
}
export interface AiQuestionBankResponse {
    questions: AiGeneratedQuestion[];
}
export interface AiDocumentFile {
    originalName: string;
    mimeType: string;
    size: number;
    filePath: string;
}
export interface AiQuestionBuilderPayload {
    teacherId: string;
    folderId: string;
    files: AiDocumentFile[];
    additionalInstructions?: string;
}
