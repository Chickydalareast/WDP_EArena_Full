import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InitManualExamDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalScore: number;

  @IsMongoId({ message: 'ID Môn học không đúng định dạng.' })
  @IsNotEmpty({ message: 'Bắt buộc phải chọn Môn học cho đề thi.' })
  subjectId: string;
}
