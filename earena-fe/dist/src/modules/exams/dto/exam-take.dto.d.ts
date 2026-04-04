import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class StartExamDto {
    courseId: string;
    lessonId: string;
}
export declare class AutoSaveDto {
    questionId: string;
    selectedAnswerId: string;
}
export declare class GetStudentHistoryDto extends PaginationDto {
    courseId?: string;
    lessonId?: string;
}
export declare class GetStudentHistoryOverviewDto extends PaginationDto {
    courseId?: string;
}
export declare class GetLessonAttemptsParamDto {
    lessonId: string;
}
export declare class GetLessonAttemptsQueryDto extends PaginationDto {
}
