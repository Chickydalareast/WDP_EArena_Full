import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CommunityUserCommunityStatus } from '../constants/community.constants';

@Schema({ timestamps: true, collection: 'community_user_profiles' })
export class CommunityUserProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ default: 0 })
  reputation: number;

  @Prop({ type: [String], default: [] })
  badges: string[];

  @Prop({ default: 0, min: 0 })
  postsCount: number;

  @Prop({ default: 0, min: 0 })
  commentsCount: number;

  @Prop({ default: 0, min: 0 })
  helpfulReceived: number;

  @Prop({ default: 0, min: 0 })
  savesReceived: number;

  @Prop({
    type: String,
    enum: CommunityUserCommunityStatus,
    default: CommunityUserCommunityStatus.ACTIVE,
    index: true,
  })
  communityStatus: CommunityUserCommunityStatus;

  @Prop({ type: Date, default: null })
  mutedUntil?: Date | null;

  @Prop({ trim: true })
  moderationNote?: string;

  @Prop({ type: Date, default: null })
  lastDigestNotifiedAt?: Date | null;
}

export type CommunityUserProfileDocument = CommunityUserProfile & Document;
export const CommunityUserProfileSchema = SchemaFactory.createForClass(
  CommunityUserProfile,
);
