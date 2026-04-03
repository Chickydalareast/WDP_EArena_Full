import { IsArray, IsMongoId, ArrayMinSize } from 'class-validator';

export class BulkPublishQuestionDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Phải chọn ít nhất 1 câu hỏi để xuất bản.' })
  @IsMongoId({ each: true, message: 'ID câu hỏi không hợp lệ.' })
  questionIds: string[];
}
