import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  CommunityReactionKind,
  CommunityReactionTarget,
} from '../constants/community.constants';

@Schema({ timestamps: true, collection: 'community_reactions' })
export class CommunityReaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: CommunityReactionTarget, required: true })
  targetType: CommunityReactionTarget;

  @Prop({ type: Types.ObjectId, required: true })
  targetId: Types.ObjectId;

  @Prop({ type: String, enum: CommunityReactionKind, required: true })
  kind: CommunityReactionKind;
}

export type CommunityReactionDocument = CommunityReaction & Document;
export const CommunityReactionSchema =
  SchemaFactory.createForClass(CommunityReaction);

CommunityReactionSchema.index(
  { userId: 1, targetType: 1, targetId: 1 },
  { unique: true },
);
