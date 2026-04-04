import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'community_moderation_audits' })
export class CommunityModerationAudit {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  actorId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  action: string;

  @Prop({ trim: true })
  targetType?: string;

  @Prop({ type: Types.ObjectId })
  targetId?: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  meta: Record<string, unknown>;
}

export type CommunityModerationAuditDocument = CommunityModerationAudit &
  Document;
export const CommunityModerationAuditSchema = SchemaFactory.createForClass(
  CommunityModerationAudit,
);

CommunityModerationAuditSchema.index({ createdAt: -1 });
