import { ExamType } from '../schemas/exam.schema';
export declare class GetExamsDto {
    page: number;
    limit: number;
    search?: string;
    type?: ExamType;
    subjectId?: string;
}
