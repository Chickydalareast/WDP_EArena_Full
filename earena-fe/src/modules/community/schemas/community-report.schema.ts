import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  CommunityReportStatus,
  CommunityReportTarget,
} from '../constants/community.constants';

@Schema({ timestamps: true, collection: 'community_reports' })
export class CommunityReport {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reporterId: Types.ObjectId;

  @Prop({ type: String, enum: CommunityReportTarget, required: true })
  targetType: CommunityReportTarget;

  @Prop({ type: Types.ObjectId, required: true })
  targetId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CommunityPost' })
  postId?: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  reason: string;

  @Prop({
    type: String,
    enum: CommunityReportStatus,
    default: CommunityReportStatus.PENDING,
    index: true,
  })
  status: CommunityReportStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  resolvedBy?: Types.ObjectId | null;

  @Prop({ type: String, trim: true })
  resolutionNote?: string;
}

export type CommunityReportDocument = CommunityReport & Document;
export const CommunityReportSchema =
  SchemaFactory.createForClass(CommunityReport);

CommunityReportSchema.index({ status: 1, createdAt: -1 });
