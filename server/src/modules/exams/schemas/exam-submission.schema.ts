import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ExamSubmissionDocument = ExamSubmission & Document;

export enum SubmissionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

@Schema({ _id: false })
export class StudentAnswer {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true }) 
  questionId: Types.ObjectId; 

  @Prop({ type: String, default: null }) 
  selectedAnswerId: string | null; 
}
const StudentAnswerSchema = SchemaFactory.createForClass(StudentAnswer);

@Schema({ timestamps: true, collection: 'exam_submissions' })
export class ExamSubmission {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Exam', required: true, index: true }) 
  examId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ExamPaper', required: true }) 
  examPaperId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true }) 
  studentId: Types.ObjectId;

  @Prop({ type: [StudentAnswerSchema], default: [] }) 
  answers: StudentAnswer[];

  @Prop({ type: Number, default: null }) 
  score: number; 

  @Prop({ type: String, enum: SubmissionStatus, default: SubmissionStatus.IN_PROGRESS }) 
  status: SubmissionStatus;

  @Prop({ type: Date, default: null }) 
  submittedAt: Date;
}

export const ExamSubmissionSchema = SchemaFactory.createForClass(ExamSubmission);

ExamSubmissionSchema.index({ examId: 1, studentId: 1 }, { unique: true });