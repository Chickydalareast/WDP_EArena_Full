import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ExamPaperDocument = ExamPaper & Document;

@Schema({ _id: false })
export class PaperAnswerOption {
  @Prop({ required: true }) id: string;
  @Prop({ required: true }) content: string;
}
const PaperAnswerOptionSchema = SchemaFactory.createForClass(PaperAnswerOption);

@Schema({ _id: false })
export class PaperQuestion {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true }) 
  originalQuestionId: Types.ObjectId; 

  @Prop({ required: true }) 
  content: string; 

  @Prop({ type: [PaperAnswerOptionSchema], default: [] }) 
  answers: PaperAnswerOption[]; 

  @Prop({ required: true }) 
  order: number;
}
const PaperQuestionSchema = SchemaFactory.createForClass(PaperQuestion);

@Schema({ timestamps: true, collection: 'exam_papers' })
export class ExamPaper {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Exam', required: true, index: true }) 
  examId: Types.ObjectId;

  @Prop({ required: true, trim: true }) 
  code: string; 

  @Prop({ type: [PaperQuestionSchema], required: true }) 
  questions: PaperQuestion[];
}

export const ExamPaperSchema = SchemaFactory.createForClass(ExamPaper);

ExamPaperSchema.index({ examId: 1, code: 1 }, { unique: true });