import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsOptional,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DifficultyLevel } from '../schemas/question.schema';
import { NoBase64Image } from '../../../common/decorators/no-base64.decorator';

class AnswerOptionDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  @NoBase64Image()
  content: string;

  @IsBoolean() // Bổ sung cờ này
  isCorrect: boolean;
}

export class CreateQuestionDto {
  @IsMongoId()
  topicId: string;

  @IsMongoId()
  folderId: string;

  @IsEnum(DifficultyLevel)
  difficultyLevel: DifficultyLevel;

  @IsString()
  @IsNotEmpty()
  @NoBase64Image() // TỬ HUYỆT ANTI-BASE64 NẰM Ở ĐÂY
  content: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerOptionDto)
  @ArrayMinSize(2)
  answers: AnswerOptionDto[];

  @IsBoolean()
  @IsOptional()
  isGroup?: boolean;

  @IsMongoId()
  @IsOptional()
  parentId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}