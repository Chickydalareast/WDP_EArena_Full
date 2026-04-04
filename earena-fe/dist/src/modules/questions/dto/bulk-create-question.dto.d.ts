import { DifficultyLevel, QuestionType } from '../schemas/question.schema';
declare class BulkAnswerOptionDto {
    id: string;
    content: string;
    isCorrect: boolean;
}
declare class BulkSubQuestionDto {
    content: string;
    explanation?: string;
    difficultyLevel?: DifficultyLevel;
    answers: BulkAnswerOptionDto[];
    attachedMedia?: string[];
}
export declare class BulkQuestionItemDto {
    type: QuestionType;
    content: string;
    explanation?: string;
    topicId?: string;
    difficultyLevel?: DifficultyLevel;
    isDraft?: boolean;
    tags?: string[];
    answers?: BulkAnswerOptionDto[];
    subQuestions?: BulkSubQuestionDto[];
    attachedMedia?: string[];
}
export declare class BulkCreateQuestionDto {
    folderId: string;
    questions: BulkQuestionItemDto[];
}
export {};
