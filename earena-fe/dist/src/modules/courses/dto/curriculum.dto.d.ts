import { ShowResultMode } from '../schemas/lesson.schema';
import { EmbeddedExamConfigDto } from './embedded-exam-config.dto';
export declare class ExamRuleConfigDto {
    timeLimit: number;
    maxAttempts: number;
    passPercentage: number;
    showResultMode: ShowResultMode;
}
export declare class CreateSectionDto {
    title: string;
    description?: string;
}
export declare class CreateLessonDto {
    title: string;
    isFreePreview?: boolean;
    primaryVideoId?: string;
    attachments?: string[];
    examId?: string;
    examRules?: ExamRuleConfigDto;
    embeddedExamConfig?: EmbeddedExamConfigDto;
    content: string;
}
export declare class UpdateSectionDto {
    title?: string;
    description?: string;
}
export declare class UpdateLessonDto {
    title?: string;
    isFreePreview?: boolean;
    primaryVideoId?: string;
    attachments?: string[];
    examRules?: ExamRuleConfigDto;
    examId?: string;
    embeddedExamConfig?: EmbeddedExamConfigDto;
    content?: string;
}
