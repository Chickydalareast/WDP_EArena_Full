import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ClassMemberDocument = ClassMember & Document;
export enum JoinStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true, collection: 'class_members' })
export class ClassMember {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Class', required: true }) classId: Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true }) studentId: Types.ObjectId;
  
  // THAY THẾ isActive BẰNG status
  @Prop({ type: String, enum: JoinStatus, default: JoinStatus.PENDING, index: true }) status: JoinStatus;
}
export const ClassMemberSchema = SchemaFactory.createForClass(ClassMember);
ClassMemberSchema.index({ classId: 1, studentId: 1 }, { unique: true }); // COMPOSITE UNIQUE INDEX