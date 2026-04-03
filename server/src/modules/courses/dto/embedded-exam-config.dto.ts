import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  IsEnum,
  IsMongoId,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DifficultyLevel } from '../../questions/schemas/question.schema';

export class EmbeddedExamRuleDto {
  @IsArray({ message: 'folderIds phải là một mảng' })
  @IsMongoId({ each: true, message: 'ID thư mục không hợp lệ' })
  @IsOptional()
  folderIds?: string[];

  @IsArray({ message: 'topicIds phải là một mảng' })
  @IsMongoId({ each: true, message: 'ID chuyên đề không hợp lệ' })
  @IsOptional()
  topicIds?: string[];

  @IsArray({ message: 'difficulties phải là một mảng' })
  @IsEnum(DifficultyLevel, { each: true, message: 'Mức độ khó không hợp lệ' })
  @IsOptional()
  difficulties?: DifficultyLevel[];

  @IsArray({ message: 'tags phải là một mảng' })
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @Type(() => Number)
  @IsInt({ message: 'Số lượng câu hỏi (limit) phải là số nguyên' })
  @Min(1, { message: 'Mỗi Rule phải lấy ít nhất 1 câu hỏi' })
  limit: number;
}

export class EmbeddedExamSectionDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên Section/Phần thi không được để trống' })
  name: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmbeddedExamRuleDto)
  rules: EmbeddedExamRuleDto[];
}

export class EmbeddedExamConfigDto {
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề đề thi không được để trống' })
  title: string;

  @Type(() => Number)
  @IsInt({ message: 'Tổng điểm phải là số nguyên' })
  @Min(0, { message: 'Tổng điểm không được âm' })
  totalScore: number;

  @IsMongoId({ message: 'ID Ma trận mẫu (matrixId) không hợp lệ' })
  @IsOptional()
  matrixId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmbeddedExamSectionDto)
  @IsOptional()
  adHocSections?: EmbeddedExamSectionDto[];
}
