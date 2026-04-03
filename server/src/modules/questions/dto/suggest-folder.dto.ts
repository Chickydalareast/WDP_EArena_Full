import { IsArray, IsMongoId, ArrayMinSize } from 'class-validator';

export class SuggestFolderDto {
  @IsArray()
  @IsMongoId({ each: true, message: 'ID câu hỏi không hợp lệ.' })
  @ArrayMinSize(1, {
    message: 'Vui lòng chọn ít nhất 1 câu hỏi để nhận gợi ý.',
  })
  questionIds: string[];
}
