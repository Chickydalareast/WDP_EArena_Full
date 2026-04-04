import { ProgressionMode } from '../enums/progression-mode.enum';
export declare class CreateCourseDto {
    title: string;
    price: number;
    description?: string;
    progressionMode?: ProgressionMode;
    isStrictExam?: boolean;
}
