import { IsOptional, IsString, IsInt, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateExamDto {
  @IsOptional()
  @IsString({ message: 'Tiêu đề phải là chuỗi văn bản.' })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống rỗng.' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi văn bản.' })
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tổng điểm phải là số nguyên.' })
  @Min(0, { message: 'Tổng điểm không được âm.' })
  totalScore?: number;
}
