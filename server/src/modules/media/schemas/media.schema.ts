import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MediaDocument = Media & Document;

export enum MediaContext {
  AVATAR = 'avatar',
  QUESTION = 'question',
  GENERAL = 'general',
}

@Schema({ timestamps: true, collection: 'media' })
export class Media {
  @Prop({ required: true, trim: true })
  originalName: string;

  @Prop({ required: true, unique: true, index: true })
  publicId: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;

  @Prop({ default: null })
  blurHash: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  uploadedBy: Types.ObjectId;

  @Prop({ type: String, enum: MediaContext, default: MediaContext.GENERAL, index: true })
  context: MediaContext;
}

export const MediaSchema = SchemaFactory.createForClass(Media);