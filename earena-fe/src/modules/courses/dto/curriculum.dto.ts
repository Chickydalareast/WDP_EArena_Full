import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsMongoId,
  IsArray,
  IsInt,
  Min,
  Max,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ShowResultMode } from '../schemas/lesson.schema';
import { EmbeddedExamConfigDto } from './embedded-exam-config.dto';

export class ExamRuleConfigDto {
  @IsInt({ message: 'Thời gian làm bài phải là số nguyên' })
  @Min(0, { message: 'Thời gian làm bài không được âm' })
  timeLimit: number;

  @IsInt({ message: 'Số lần thi phải là số nguyên' })
  @Min(1, { message: 'Số lần thi tối thiểu là 1' })
  maxAttempts: number;

  @IsInt({ message: 'Điểm chuẩn phải là số nguyên' })
  @Min(0)
  @Max(100, { message: 'Điểm chuẩn tối đa là 100%' })
  passPercentage: number;

  @IsEnum(ShowResultMode, { message: 'Chế độ hiển thị kết quả không hợp lệ' })
  showResultMode: ShowResultMode;
}

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên chương/phần không được để trống' })
  title: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  description?: string;
}

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên bài học không được để trống' })
  title: string;

  @IsBoolean()
  @IsOptional()
  isFreePreview?: boolean;

  @IsMongoId({ message: 'primaryVideoId không hợp lệ' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  primaryVideoId?: string;

  @IsArray({ message: 'attachments phải là một mảng' })
  @IsMongoId({ each: true, message: 'ID tệp đính kèm không hợp lệ' })
  @IsOptional()
  attachments?: string[];

  @IsMongoId({ message: 'examId không hợp lệ' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  examId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExamRuleConfigDto)
  examRules?: ExamRuleConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmbeddedExamConfigDto)
  embeddedExamConfig?: EmbeddedExamConfigDto;

  @IsString()
  @IsNotEmpty({ message: 'Nội dung/Ghi chú bài học không được để trống' })
  content: string;
}

export class UpdateSectionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  description?: string;
}

export class UpdateLessonDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsBoolean()
  @IsOptional()
  isFreePreview?: boolean;

  @IsMongoId({ message: 'primaryVideoId không hợp lệ' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  primaryVideoId?: string;

  @IsArray({ message: 'attachments phải là một mảng' })
  @IsMongoId({ each: true, message: 'ID tệp đính kèm không hợp lệ' })
  @IsOptional()
  attachments?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ExamRuleConfigDto)
  examRules?: ExamRuleConfigDto;

  @IsMongoId({ message: 'examId không hợp lệ' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  examId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmbeddedExamConfigDto)
  embeddedExamConfig?: EmbeddedExamConfigDto;

  @IsString()
  @IsNotEmpty({ message: 'Nội dung/Ghi chú bài học không được để trống' })
  @IsOptional()
  content?: string;
}
