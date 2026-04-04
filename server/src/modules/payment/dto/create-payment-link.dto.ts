import {
  IsNumber,
  IsPositive,
  Min,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreatePaymentLinkDto {
  @IsNumber()
  @IsPositive()
  @Min(1000)
  amount: number;

  /** Đường dẫn ví sau khi thanh toán, ví dụ /student/wallet hoặc /teacher/wallet */
  @IsOptional()
  @IsString()
  @Matches(/^\/(student|teacher)\/wallet$/)
  returnPath?: string;
}
