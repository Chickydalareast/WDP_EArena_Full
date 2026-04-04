import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  CommunityPostStatus,
  CommunityPostType,
} from '../constants/community.constants';

@Schema({ _id: false })
export class CommunityCourseSnapshot {
  @Prop({ type: Types.ObjectId, required: true })
  courseId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true, index: true })
  slug: string;

  @Prop({ trim: true })
  coverUrl?: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ min: 0 })
  discountPrice?: number;

  @Prop({ required: true, trim: true })
  teacherName: string;

  @Prop({ type: Types.ObjectId, required: true })
  teacherId: Types.ObjectId;

  @Prop({ required: true, min: 0, max: 5, default: 0 })
  averageRating: number;

  @Prop({ required: true, min: 0, default: 0 })
  totalReviews: number;
}

const CommunityCourseSnapshotSchema = SchemaFactory.createForClass(
  CommunityCourseSnapshot,
);

@Schema({ timestamps: true, collection: 'community_posts' })
export class CommunityPost {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  authorId: Types.ObjectId;

  @Prop({ type: String, enum: CommunityPostType, required: true, index: true })
  type: CommunityPostType;

  @Prop({ type: String, enum: CommunityPostStatus, default: CommunityPostStatus.ACTIVE, index: true })
  status: CommunityPostStatus;

  /** Tiptap JSON string */
  @Prop({ required: true })
  bodyJson: string;

  @Prop({ required: true, trim: true })
  bodyPlain: string;

  @Prop({
    type: [
      {
        url: { type: String, required: true },
        kind: { type: String, enum: ['IMAGE', 'FILE'], required: true },
        name: { type: String },
        mime: { type: String },
      },
    ],
    default: [],
  })
  attachments: { url: string; kind: 'IMAGE' | 'FILE'; name?: string; mime?: string }[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Types.ObjectId, ref: 'Subject', index: true })
  subjectId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', index: true })
  courseId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Exam', index: true })
  examId?: Types.ObjectId;

  @Prop({ type: CommunityCourseSnapshotSchema })
  courseSnapshot?: CommunityCourseSnapshot;

  @Prop({ default: 0, min: 0 })
  commentCount: number;

  @Prop({ default: 0, min: 0 })
  reactionCount: number;

  @Prop({ default: 0, min: 0 })
  saveCount: number;

  @Prop({
    type: {
      HELPFUL: { type: Number, default: 0 },
      LOVE: { type: Number, default: 0 },
      QUALITY: { type: Number, default: 0 },
      SPOT_ON: { type: Number, default: 0 },
      THANKS: { type: Number, default: 0 },
    },
    default: {},
  })
  reactionBreakdown: Record<string, number>;

  @Prop({ default: 0 })
  hotScore: number;

  @Prop({ type: Types.ObjectId, ref: 'CommunityComment', default: null })
  bestAnswerCommentId?: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'CommunityComment', default: null })
  pinnedCommentId?: Types.ObjectId | null;

  @Prop({ default: false, index: true })
  isFeatured: boolean;

  @Prop({ default: false })
  commentsLocked: boolean;
}

export type CommunityPostDocument = CommunityPost & Document;
export const CommunityPostSchema = SchemaFactory.createForClass(CommunityPost);

CommunityPostSchema.index({ status: 1, createdAt: -1 });
CommunityPostSchema.index({ status: 1, subjectId: 1, createdAt: -1 });
CommunityPostSchema.index({ status: 1, type: 1, createdAt: -1 });
CommunityPostSchema.index({ status: 1, courseId: 1, createdAt: -1 });
CommunityPostSchema.index({ status: 1, examId: 1, createdAt: -1 });
CommunityPostSchema.index({ status: 1, hotScore: -1, createdAt: -1 });
CommunityPostSchema.index({ authorId: 1, status: 1, createdAt: -1 });
CommunityPostSchema.index({ bodyPlain: 'text', tags: 'text' });
