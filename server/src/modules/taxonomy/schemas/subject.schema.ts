import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubjectDocument = Subject & Document;
@Schema({ timestamps: true, collection: 'subjects' })
export class Subject {
  @Prop({ required: true, trim: true }) name: string;
  @Prop({ required: true, unique: true, index: true, uppercase: true, trim: true }) code: string;
  @Prop({ default: true }) isActive: boolean;
}
export const SubjectSchema = SchemaFactory.createForClass(Subject);