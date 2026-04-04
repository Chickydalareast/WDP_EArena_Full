import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'community_blocks' })
export class CommunityBlock {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  blockerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  blockedUserId: Types.ObjectId;
}

export type CommunityBlockDocument = CommunityBlock & Document;
export const CommunityBlockSchema =
  SchemaFactory.createForClass(CommunityBlock);

CommunityBlockSchema.index(
  { blockerId: 1, blockedUserId: 1 },
  { unique: true },
);
