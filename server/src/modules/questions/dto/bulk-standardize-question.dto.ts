// src/modules/questions/dto/bulk-standardize-question.dto.ts
import { IsMongoId, IsEnum, IsArray, ArrayMinSize, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { DifficultyLevel } from '../schemas/question.schema';

export class BulkStandardizeQuestionDto {
  @IsArray()
  @IsMongoId({ each: true, message: 'Danh sách ID câu hỏi chứa định dạng không hợp lệ.' })
  @ArrayMinSize(1, { message: 'Phải chọn ít nhất 1 câu hỏi để chuẩn hóa.' })
  questionIds: string[];

  @IsMongoId({ message: 'ID Chuyên đề (topicId) không hợp lệ.' })
  @IsNotEmpty({ message: 'Bắt buộc chọn Chuyên đề để chuẩn hóa.' })
  topicId: string;

  @IsEnum(
    Object.values(DifficultyLevel).filter(lvl => lvl !== DifficultyLevel.UNKNOWN), 
    { message: 'Bắt buộc chọn Mức độ nhận thức hợp lệ (Không được để trống/UNKNOWN).' }
  )
  @IsNotEmpty({ message: 'Bắt buộc chọn Mức độ nhận thức.' })
  difficultyLevel: DifficultyLevel;

  @IsOptional()
  @IsBoolean()
  autoOrganize?: boolean; 
}