import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CommunityFollowTarget } from '../constants/community.constants';

@Schema({ timestamps: true, collection: 'community_follows' })
export class CommunityFollow {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  followerId: Types.ObjectId;

  @Prop({ type: String, enum: CommunityFollowTarget, required: true })
  targetType: CommunityFollowTarget;

  @Prop({ type: Types.ObjectId, required: true })
  targetId: Types.ObjectId;
}

export type CommunityFollowDocument = CommunityFollow & Document;
export const CommunityFollowSchema =
  SchemaFactory.createForClass(CommunityFollow);

CommunityFollowSchema.index(
  { followerId: 1, targetType: 1, targetId: 1 },
  { unique: true },
);
