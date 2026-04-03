import { Type, Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
  ValidateIf,
} from 'class-validator';
import { DifficultyLevel, QuestionType } from '../schemas/question.schema';
import { IsRequiredIfPublished } from './create-question.dto';
import { NoBase64Image } from '../../../common/decorators/no-base64.decorator';

class BulkAnswerOptionDto {
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

class BulkSubQuestionDto {
  @IsString()
  @IsNotEmpty()
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
  @Type(() => BulkAnswerOptionDto)
  @ArrayMinSize(2, { message: 'Câu hỏi trắc nghiệm phải có ít nhất 2 đáp án.' })
  answers: BulkAnswerOptionDto[];

  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  attachedMedia?: string[];
}

export class BulkQuestionItemDto {
  @IsEnum(QuestionType)
  @IsNotEmpty()
  type: QuestionType;

  @IsString()
  @IsNotEmpty()
  @NoBase64Image()
  content: string;

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

  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @ValidateIf((o) => o.type !== QuestionType.PASSAGE)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkAnswerOptionDto)
  @ArrayMinSize(2, { message: 'Câu hỏi trắc nghiệm phải có ít nhất 2 đáp án.' })
  answers?: BulkAnswerOptionDto[];

  @ValidateIf((o) => o.type === QuestionType.PASSAGE)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkSubQuestionDto)
  subQuestions?: BulkSubQuestionDto[];

  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true, message: 'Định dạng ID Media không hợp lệ.' })
  attachedMedia?: string[];
}

export class BulkCreateQuestionDto {
  @IsMongoId({ message: 'ID thư mục không hợp lệ.' })
  @IsNotEmpty()
  folderId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkQuestionItemDto)
  @ArrayMinSize(1, { message: 'Bắt buộc phải truyền ít nhất 1 câu hỏi.' })
  questions: BulkQuestionItemDto[];
}
