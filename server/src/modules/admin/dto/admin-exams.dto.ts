import { IsEnum, IsMongoId, IsOptional, IsString, IsBoolean } from 'class-validator';
import { PaginationQueryDto } from './pagination.dto';
import { ExamType } from '../../exams/schemas/exam.schema';

export class AdminListExamsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ExamType)
  type?: ExamType;

  @IsOptional()
  @IsMongoId()
  teacherId?: string;
}

export class AdminSetExamPublishDto {
  @IsBoolean()
  isPublished: boolean;
}
