import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ExamAssignmentDocument = ExamAssignment & Document;
@Schema({ timestamps: true, collection: 'exam_assignments' })
export class ExamAssignment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Exam', required: true, index: true }) examId: Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Class', required: true, index: true }) classId: Types.ObjectId;
  @Prop({ required: true }) startTime: Date;
  @Prop({ required: true }) endTime: Date;
  @Prop({ required: true, min: 1 }) timeLimit: number;
  @Prop({ default: false }) isPublished: boolean;
}
export const ExamAssignmentSchema = SchemaFactory.createForClass(ExamAssignment);