import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CoursePromotionDocument = CoursePromotion & Document;

@Schema({ timestamps: true, collection: 'course_promotions' })
export class CoursePromotion {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  teacherId: Types.ObjectId;

  @Prop({ required: true, index: true })
  expiresAt: Date;

  @Prop({ required: true, min: 0 })
  amountPaid: number;

  @Prop({ required: true, min: 1 })
  durationDays: number;
}

export const CoursePromotionSchema =
  SchemaFactory.createForClass(CoursePromotion);

CoursePromotionSchema.index({ expiresAt: 1 });
CoursePromotionSchema.index({ courseId: 1, expiresAt: -1 });
