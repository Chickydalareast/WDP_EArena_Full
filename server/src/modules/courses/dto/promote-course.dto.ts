import { IsIn, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class PromoteCourseDto {
  @Type(() => Number)
  @IsInt()
  @IsIn([7, 14, 30])
  durationDays: 7 | 14 | 30;
}
