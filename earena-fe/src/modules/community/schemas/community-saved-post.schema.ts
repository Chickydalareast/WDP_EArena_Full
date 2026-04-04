import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'community_saved_posts' })
export class CommunitySavedPost {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CommunityPost', required: true })
  postId: Types.ObjectId;
}

export type CommunitySavedPostDocument = CommunitySavedPost & Document;
export const CommunitySavedPostSchema =
  SchemaFactory.createForClass(CommunitySavedPost);

CommunitySavedPostSchema.index({ userId: 1, postId: 1 }, { unique: true });
CommunitySavedPostSchema.index({ userId: 1, createdAt: -1 });
