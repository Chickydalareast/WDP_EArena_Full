import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ExamDocument = Exam & Document;

export enum ExamType { 
  OFFICIAL = 'OFFICIAL', 
  PRACTICE = 'PRACTICE' 
}

@Schema({ timestamps: true, collection: 'exams' })
export class Exam {
  @Prop({ required: true, trim: true }) 
  title: string;

  @Prop({ trim: true }) 
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true }) 
  teacherId: Types.ObjectId;

  @Prop({ required: true, min: 1 }) 
  duration: number;

  @Prop({ required: true, min: 0 }) 
  totalScore: number;

  @Prop({ default: false }) 
  isPublished: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ExamMatrix', default: null }) 
  matrixId: Types.ObjectId; 

  @Prop({ type: String, enum: ExamType, default: ExamType.PRACTICE }) 
  type: ExamType;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);