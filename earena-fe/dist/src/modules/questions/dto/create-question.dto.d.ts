import { ValidationOptions } from 'class-validator';
import { DifficultyLevel, QuestionType } from '../schemas/question.schema';
export declare function IsRequiredIfPublished(validationOptions?: ValidationOptions): (object: object, propertyName: string) => void;
declare class AnswerOptionDto {
    id: string;
    content: string;
    isCorrect: boolean;
}
export declare class CreateQuestionDto {
    topicId?: string;
    folderId: string;
    type: QuestionType;
    difficultyLevel?: DifficultyLevel;
    content: string;
    explanation?: string;
    orderIndex?: number;
    answers?: AnswerOptionDto[];
    parentPassageId?: string;
    tags?: string[];
    isDraft?: boolean;
    attachedMedia?: string[];
}
export {};
