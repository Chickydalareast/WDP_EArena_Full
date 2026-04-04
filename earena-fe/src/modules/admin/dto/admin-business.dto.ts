import { IsOptional, IsString } from 'class-validator';

export class AdminBusinessMetricsQueryDto {
  @IsOptional()
  @IsString()
  from?: string; // ISO date

  @IsOptional()
  @IsString()
  to?: string; // ISO date
}
