import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PricingPlanCode } from '../schemas/pricing-plan.schema';

export class AdminCreatePricingPlanDto {
  @IsString()
  name: string;

  @IsEnum(PricingPlanCode)
  code: PricingPlanCode;

  @IsInt()
  @Min(0)
  priceMonthly: number;

  @IsInt()
  @Min(0)
  priceYearly: number;

  @IsOptional()
  @IsArray()
  benefits?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AdminUpdatePricingPlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceMonthly?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceYearly?: number;

  @IsOptional()
  @IsArray()
  benefits?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
