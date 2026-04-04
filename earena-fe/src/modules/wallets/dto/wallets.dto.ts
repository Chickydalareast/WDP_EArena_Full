import { IsNumber, Min, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class MockDepositDto {
  @IsNumber()
  @Min(1000, { message: 'Số tiền nạp tối thiểu là 1000 Coin.' })
  amount: number;
}

export class GetTransactionsDto {
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
}
