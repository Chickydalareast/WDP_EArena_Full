import { DifficultyLevel } from '../schemas/question.schema';
declare class UpdatePassageAnswerOptionDto {
    id: string;
    content: string;
    isCorrect: boolean;
}
declare class UpdatePassageSubQuestionDto {
    id?: string;
    content: string;
    explanation?: string;
    difficultyLevel?: DifficultyLevel;
    answers: UpdatePassageAnswerOptionDto[];
    attachedMedia?: string[];
}
export declare class UpdatePassageDto {
    content?: string;
    explanation?: string;
    topicId?: string;
    difficultyLevel?: DifficultyLevel;
    tags?: string[];
    subQuestions: UpdatePassageSubQuestionDto[];
    attachedMedia?: string[];
    isDraft?: boolean;
}
export {};
