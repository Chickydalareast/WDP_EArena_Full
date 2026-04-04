import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'community_comments' })
export class CommunityComment {
  @Prop({ type: Types.ObjectId, ref: 'CommunityPost', required: true, index: true })
  postId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  authorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CommunityComment', default: null, index: true })
  parentCommentId?: Types.ObjectId | null;

  @Prop({ required: true, trim: true, maxlength: 8000 })
  body: string;

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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  mentionedUserIds: Types.ObjectId[];

  @Prop({ default: false })
  isTeacherAnswer: boolean;

  @Prop({ default: false })
  isPinned: boolean;

  @Prop({ default: false })
  isRemoved: boolean;

  @Prop({ default: 0, min: 0 })
  reactionCount: number;

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
}

export type CommunityCommentDocument = CommunityComment & Document;
export const CommunityCommentSchema =
  SchemaFactory.createForClass(CommunityComment);

CommunityCommentSchema.index({ postId: 1, parentCommentId: 1, createdAt: 1 });
CommunityCommentSchema.index({ postId: 1, createdAt: 1 });
