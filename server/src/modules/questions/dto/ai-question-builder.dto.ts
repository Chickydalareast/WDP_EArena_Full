import { IsString, IsNotEmpty, IsMongoId, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class GenerateAiQuestionDto {
  @IsMongoId({ message: 'ID thư mục lưu trữ không hợp lệ.' })
  @IsNotEmpty({
    message: 'Bắt buộc phải chọn thư mục (Folder) để lưu bộ câu hỏi.',
  })
  folderId: string;

  @IsOptional()
  @IsString({ message: 'Ghi chú (Prompt) phải là chuỗi văn bản.' })
  @Transform(({ value }) => value?.trim())
  additionalInstructions?: string;
}
