import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class GenerateAiCourseDto {
  @IsOptional()
  @Transform(({ value }) => {
    // multipart/form-data gửi lên luôn là chuỗi, phải ép kiểu an toàn
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsInt({ message: 'Số lượng chương mục phải là số nguyên' })
  @Min(1, { message: 'Cần ít nhất 1 chương' })
  @Max(50, { message: 'Tối đa 50 chương để đảm bảo hiệu suất AI' })
  targetSectionCount?: number;

  @IsOptional()
  @IsString({ message: 'Ghi chú (Prompt) phải là chuỗi văn bản' })
  @Transform(({ value }) => value?.trim())
  additionalInstructions?: string;
}
