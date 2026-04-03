import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class CreateCourseReviewDto {
  @IsNumber()
  @Min(1, { message: 'Đánh giá thấp nhất là 1 sao' })
  @Max(5, { message: 'Đánh giá cao nhất là 5 sao' })
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class ReplyCourseReviewDto {
  @IsString({ message: 'Nội dung phản hồi phải là chuỗi văn bản' })
  @IsNotEmpty({ message: 'Nội dung phản hồi không được để trống' })
  reply: string;
}
