import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'course_reviews' })
export class CourseReview {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ trim: true })
  comment?: string;

  @Prop({ trim: true })
  teacherReply?: string;

  @Prop({ type: Date })
  repliedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export type CourseReviewDocument = CourseReview & Document;
export const CourseReviewSchema = SchemaFactory.createForClass(CourseReview);
CourseReviewSchema.index({ courseId: 1, userId: 1 }, { unique: true });
