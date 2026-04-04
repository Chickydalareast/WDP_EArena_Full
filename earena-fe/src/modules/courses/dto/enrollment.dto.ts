import { IsMongoId, IsNotEmpty } from 'class-validator';

export class MarkLessonDto {
  @IsMongoId({ message: 'courseId không hợp lệ' })
  @IsNotEmpty()
  courseId: string;

  @IsMongoId({ message: 'lessonId không hợp lệ' })
  @IsNotEmpty()
  lessonId: string;
}
