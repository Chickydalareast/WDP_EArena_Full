import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ClassDocument = Class & Document;
@Schema({ timestamps: true, collection: 'classes' })
export class Class {
  @Prop({ required: true, trim: true }) name: string;
  @Prop({ trim: true }) description: string;
  @Prop({ required: true, unique: true, index: true }) code: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true }) teacherId: Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.ObjectId, default: null }) coverImageId: Types.ObjectId;
  @Prop({ default: false }) isLocked: boolean;
  @Prop({ default: true, index: true }) isPublic: boolean;
}
export const ClassSchema = SchemaFactory.createForClass(Class);