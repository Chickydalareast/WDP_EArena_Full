import { IsOptional, IsMongoId, IsString, IsBoolean, IsEnum, IsArray, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { DifficultyLevel } from '../schemas/question.schema';

export class GetQuestionsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsMongoId({ message: 'ID thư mục không hợp lệ' })
  folderId?: string;

  @IsOptional()
  @IsMongoId({ message: 'ID chuyên đề không hợp lệ' })
  topicId?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
  @IsArray()
  @IsEnum(DifficultyLevel, { each: true, message: 'Mức độ khó không hợp lệ' })
  difficultyLevels?: DifficultyLevel[];

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isDraft?: boolean;
}