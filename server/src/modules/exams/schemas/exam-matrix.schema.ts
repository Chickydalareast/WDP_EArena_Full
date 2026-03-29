import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ExamMatrixDocument = ExamMatrix & Document;
@Schema({ timestamps: true, collection: 'exam_matrices' })
export class ExamMatrix {
  @Prop({ required: true }) title: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true }) teacherId: Types.ObjectId;
  @Prop({ type: [MongooseSchema.Types.Mixed] }) criteria: any[];
}
export const ExamMatrixSchema = SchemaFactory.createForClass(ExamMatrix);