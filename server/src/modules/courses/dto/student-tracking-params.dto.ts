import { IsMongoId, IsOptional } from 'class-validator';

export class StudentTrackingParamDto {
    @IsMongoId()
    courseId: string;

    @IsMongoId()
    studentId: string;

    @IsOptional()
    @IsMongoId()
    lessonId?: string;
}