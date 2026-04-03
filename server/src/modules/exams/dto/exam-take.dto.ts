import { IsMongoId, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

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

export class GetStudentHistoryDto extends PaginationDto {
  @IsOptional()
  @IsMongoId({ message: 'courseId không hợp lệ.' })
  courseId?: string;

  @IsOptional()
  @IsMongoId({ message: 'lessonId không hợp lệ.' })
  lessonId?: string;
}

export class GetStudentHistoryOverviewDto extends PaginationDto {
  @IsOptional()
  @IsMongoId({ message: 'courseId không hợp lệ.' })
  courseId?: string;
}

export class GetLessonAttemptsParamDto {
  @IsMongoId({ message: 'lessonId không hợp lệ.' })
  @IsNotEmpty({ message: 'Phải cung cấp lessonId.' })
  lessonId: string;
}

export class GetLessonAttemptsQueryDto extends PaginationDto {}
