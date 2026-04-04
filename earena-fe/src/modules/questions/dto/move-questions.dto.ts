import { IsMongoId, IsArray, ArrayMinSize } from 'class-validator';

export class MoveQuestionsDto {
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMinSize(1, { message: 'Chọn ít nhất 1 câu hỏi để di chuyển.' })
  questionIds: string[];

  @IsMongoId({ message: 'Thư mục đích không hợp lệ.' })
  destFolderId: string;
}
