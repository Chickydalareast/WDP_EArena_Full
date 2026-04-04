import {
  IsBoolean,
  IsArray,
  IsOptional,
  ValidateNested,
  IsMongoId,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class PointDataDto {
  @IsMongoId({ message: 'ID câu hỏi không hợp lệ.' })
  questionId: string;

  @IsNumber({}, { message: 'Điểm số phải là định dạng số.' })
  @Min(0, { message: 'Điểm số không được âm.' })
  points: number;
}

export class UpdatePaperPointsDto {
  @IsOptional()
  @IsBoolean({ message: 'Cờ chia đều điểm phải là kiểu boolean.' })
  divideEqually?: boolean;

  @IsOptional()
  @IsArray({ message: 'Dữ liệu điểm phải là một mảng.' })
  @ValidateNested({ each: true })
  @Type(() => PointDataDto)
  pointsData?: PointDataDto[];
}
