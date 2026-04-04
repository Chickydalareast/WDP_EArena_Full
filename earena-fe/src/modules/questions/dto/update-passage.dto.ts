import { Type, Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import { DifficultyLevel } from '../schemas/question.schema';
import { IsRequiredIfPublished } from './create-question.dto';
import { NoBase64Image } from '../../../common/decorators/no-base64.decorator';

class UpdatePassageAnswerOptionDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  @NoBase64Image()
  content: string;

  @IsBoolean()
  isCorrect: boolean;
}

class UpdatePassageSubQuestionDto {
  @IsOptional()
  @IsMongoId()
  id?: string;

  @IsString()
  @NoBase64Image()
  content: string;

  @IsOptional()
  @IsString()
  @NoBase64Image()
  explanation?: string;

  @IsOptional()
  @IsEnum(DifficultyLevel)
  @IsRequiredIfPublished()
  difficultyLevel?: DifficultyLevel;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePassageAnswerOptionDto)
  answers: UpdatePassageAnswerOptionDto[];

  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  attachedMedia?: string[];
}

export class UpdatePassageDto {
  @IsOptional()
  @IsString()
  @NoBase64Image()
  content?: string;

  @IsOptional()
  @IsString()
  @NoBase64Image()
  explanation?: string;

  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsMongoId({ message: 'ID Chuyên đề không hợp lệ.' })
  @IsRequiredIfPublished()
  topicId?: string;

  @IsOptional()
  @IsEnum(DifficultyLevel)
  @IsRequiredIfPublished()
  difficultyLevel?: DifficultyLevel;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePassageSubQuestionDto)
  subQuestions: UpdatePassageSubQuestionDto[];

  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  attachedMedia?: string[];

  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;
}
