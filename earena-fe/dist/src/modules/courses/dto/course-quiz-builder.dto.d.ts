import { DifficultyLevel } from '../../questions/schemas/question.schema';
import { ShowResultMode } from '../schemas/lesson.schema';
declare class DynamicFilterDto {
    difficulty: DifficultyLevel;
    count: number;
}
declare class MatrixRuleDto {
    folderIds?: string[];
    topicIds?: string[];
    difficulties?: DifficultyLevel[];
    tags?: string[];
    limit: number;
}
declare class MatrixSectionDto {
    name: string;
    orderIndex?: number;
    rules: MatrixRuleDto[];
}
declare class DynamicExamConfigDto {
    sourceFolders?: string[];
    mixRatio?: DynamicFilterDto[];
    matrixId?: string;
    adHocSections?: MatrixSectionDto[];
}
declare class ExamRuleConfigDto {
    timeLimit: number;
    maxAttempts: number;
    passPercentage: number;
    showResultMode: ShowResultMode;
}
export declare class CreateCourseQuizDto {
    courseId: string;
    sectionId: string;
    title: string;
    content: string;
    isFreePreview: boolean;
    totalScore: number;
    dynamicConfig: DynamicExamConfigDto;
    examRules: ExamRuleConfigDto;
}
declare const UpdateCourseQuizDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateCourseQuizDto, "courseId" | "sectionId">>>;
export declare class UpdateCourseQuizDto extends UpdateCourseQuizDto_base {
    courseId: string;
    lessonId: string;
}
export declare class DeleteCourseQuizDto {
    courseId: string;
    lessonId: string;
}
export declare class GetQuizMatricesDto {
    courseId: string;
    page?: number;
    limit?: number;
    search?: string;
}
export declare class RulePreviewDto {
    folderIds?: string[];
    topicIds?: string[];
    difficulties?: DifficultyLevel[];
    tags?: string[];
    limit: number;
}
export declare class PreviewQuizConfigDto {
    matrixId?: string;
    adHocSections?: MatrixSectionDto[];
}
export {};
