import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { BillingCycle } from '../schemas/subscription-transaction.schema';

export class UpgradePlanDto {
  @IsMongoId({ message: 'Mã gói cước không hợp lệ.' })
  @IsNotEmpty()
  planId: string;

  @IsEnum(BillingCycle, {
    message: 'Chu kỳ thanh toán phải là MONTHLY hoặc YEARLY.',
  })
  @IsNotEmpty()
  billingCycle: BillingCycle;
}
