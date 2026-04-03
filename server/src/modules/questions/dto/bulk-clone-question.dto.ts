import { IsArray, IsMongoId, IsNotEmpty, ArrayMinSize } from 'class-validator';

export class BulkCloneQuestionDto {
  @IsArray()
  @IsMongoId({ each: true, message: 'Danh sách ID câu hỏi không hợp lệ.' })
  @ArrayMinSize(1, { message: 'Phải chọn ít nhất 1 câu hỏi để nhân bản.' })
  questionIds: string[];

  @IsMongoId({ message: 'ID thư mục đích không hợp lệ.' })
  @IsNotEmpty()
  destFolderId: string;
}
