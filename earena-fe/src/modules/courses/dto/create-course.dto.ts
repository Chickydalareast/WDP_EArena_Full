import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ProgressionMode } from '../enums/progression-mode.enum';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên khóa học không được để trống' })
  title: string;

  @IsNumber()
  @Min(0, { message: 'Giá khóa học không được âm' })
  price: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProgressionMode, { message: 'Chế độ học không hợp lệ' })
  @IsOptional()
  progressionMode?: ProgressionMode;

  @IsBoolean({ message: 'Cấu hình thi bắt buộc phải là định dạng boolean' })
  @IsOptional()
  isStrictExam?: boolean;
}
