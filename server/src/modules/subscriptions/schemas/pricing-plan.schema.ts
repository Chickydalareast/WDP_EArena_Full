import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PricingPlanDocument = PricingPlan & Document;

export enum PricingPlanCode {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

@Schema({ timestamps: true, collection: 'pricing_plans' })
export class PricingPlan {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: PricingPlanCode, unique: true, index: true })
  code: PricingPlanCode;

  @Prop({ required: true, min: 0 })
  priceMonthly: number;

  @Prop({ required: true, min: 0 })
  priceYearly: number;

  @Prop({ type: [String], default: [] })
  benefits: string[];

  @Prop({ default: true, index: true })
  isActive: boolean;

  
  @Prop({ required: true, default: false })
  canCreatePaidCourse: boolean;

  @Prop({ required: true, default: true })
  isUnlimitedCourses: boolean;

  @Prop({ required: true, default: 0, min: 0 })
  maxCourses: number;
}

export const PricingPlanSchema = SchemaFactory.createForClass(PricingPlan);