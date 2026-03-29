import { IsMongoId, IsNotEmpty, IsString, IsOptional, ValidateIf, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class StartExamDto {
  @IsMongoId({ message: 'courseId không hợp lệ.' })
  @IsNotEmpty({ message: 'Phải cung cấp courseId.' })
  courseId: string;

  @IsMongoId({ message: 'lessonId không hợp lệ.' })
  @IsNotEmpty({ message: 'Phải cung cấp lessonId.' })
  lessonId: string;
}

export class AutoSaveDto {
  @IsMongoId({ message: 'questionId không hợp lệ.' })
  @IsNotEmpty()
  questionId: string;

  @IsString()
  @IsNotEmpty()
  selectedAnswerId: string;
}

export class GetStudentHistoryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsMongoId({ message: 'courseId không hợp lệ.' })
  courseId?: string;

  @IsOptional()
  @IsMongoId({ message: 'lessonId không hợp lệ.' })
  lessonId?: string;
}