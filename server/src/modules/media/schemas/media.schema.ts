import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MediaDocument = Media & Document;

export enum MediaContext {
  AVATAR = 'avatar',
  COURSE_THUMBNAIL = 'course_thumbnail',
  LESSON_VIDEO = 'lesson_video',
  LESSON_DOCUMENT = 'lesson_document',
  QUESTION = 'question',
  GENERAL = 'general',
  LESSON_DISCUSSION = 'lesson_discussion',
}

export enum MediaProvider {
  CLOUDINARY = 'CLOUDINARY',
  GOOGLE_DRIVE = 'GOOGLE_DRIVE',
  YOUTUBE = 'YOUTUBE',
  FIREBASE = 'FIREBASE',
}

export enum MediaStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
}

@Schema({ timestamps: true, collection: 'media' })
export class Media {
  @Prop({ required: true, trim: true })
  originalName: string;

  @Prop({ required: true, unique: true, index: true })
  publicId: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true, enum: MediaProvider, index: true })
  provider: MediaProvider;

  @Prop({
    required: true,
    enum: MediaStatus,
    default: MediaStatus.READY,
    index: true,
  })
  status: MediaStatus;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: false })
  width?: number;

  @Prop({ required: false })
  height?: number;

  @Prop({ required: false, default: null })
  blurHash?: string;

  @Prop({ required: false })
  duration?: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  uploadedBy: Types.ObjectId;

  @Prop({
    type: String,
    enum: MediaContext,
    default: MediaContext.GENERAL,
    index: true,
  })
  context: MediaContext;
}

export const MediaSchema = SchemaFactory.createForClass(Media);

MediaSchema.index({ status: 1, createdAt: 1 });
