import { Types } from 'mongoose';
import { BillingCycle } from '../schemas/subscription-transaction.schema';

export interface UpgradePlanPayload {
  teacherId: string | Types.ObjectId;
  planId: string | Types.ObjectId;
  billingCycle: BillingCycle;
}
