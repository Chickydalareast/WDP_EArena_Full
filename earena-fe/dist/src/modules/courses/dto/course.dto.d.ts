import { ProgressionMode } from '../enums/progression-mode.enum';
export declare class UpdateCourseDto {
    title?: string;
    price?: number;
    discountPrice?: number;
    description?: string;
    benefits?: string[];
    requirements?: string[];
    coverImageId?: string;
    promotionalVideoId?: string | null;
    progressionMode?: ProgressionMode;
    isStrictExam?: boolean;
}
export declare class ReorderSectionItemDto {
    id: string;
    order: number;
}
export declare class ReorderLessonItemDto {
    id: string;
    order: number;
    sectionId: string;
}
export declare class ReorderCurriculumDto {
    sections?: ReorderSectionItemDto[];
    lessons?: ReorderLessonItemDto[];
}
