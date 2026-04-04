import {
  IsOptional,
  IsArray,
  IsString,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DifficultyLevel } from '../schemas/question.schema';
import { RuleQuestionType } from '../../exams/interfaces/exam-matrix.interface';

export class ActiveFiltersDto {
  @IsOptional()
  @IsArray()
  @IsString({
    each: true,
    message: 'folderIds phải là mảng các chuỗi ID hợp lệ',
  })
  folderIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topicIds?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(DifficultyLevel, { each: true })
  difficulties?: DifficultyLevel[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isDraft?: boolean;

  @IsOptional()
  @IsEnum(RuleQuestionType)
  questionType?: RuleQuestionType;
}