import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'course_sections' })
export class Section {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true, default: 0 })
  order: number;
}

export type SectionDocument = Section & Document;
export const SectionSchema = SchemaFactory.createForClass(Section);
SectionSchema.index({ courseId: 1, order: 1 }, { unique: true });
