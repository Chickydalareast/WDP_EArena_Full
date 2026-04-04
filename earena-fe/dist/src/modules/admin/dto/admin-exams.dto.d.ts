import { PaginationQueryDto } from './pagination.dto';
import { ExamType } from '../../exams/schemas/exam.schema';
export declare class AdminListExamsQueryDto extends PaginationQueryDto {
    search?: string;
    type?: ExamType;
    teacherId?: string;
}
export declare class AdminSetExamPublishDto {
    isPublished: boolean;
}
