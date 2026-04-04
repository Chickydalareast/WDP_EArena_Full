import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import {
  DifficultyLevel,
  QuestionType,
} from '../../questions/schemas/question.schema';

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

  @Prop({ type: String, enum: QuestionType, required: true })
  type: QuestionType;

  @Prop({ type: MongooseSchema.Types.ObjectId, default: null })
  parentPassageId: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  orderIndex: number;

  @Prop({ type: String, default: null })
  explanation: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: String, enum: DifficultyLevel, required: true })
  difficultyLevel: DifficultyLevel;

  @Prop({ type: [PaperAnswerOptionSchema], default: [] })
  answers: PaperAnswerOption[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Media' }],
    default: [],
  })
  attachedMedia: Types.ObjectId[];

  @Prop({ type: Number, default: null })
  points: number | null;
}
const PaperQuestionSchema = SchemaFactory.createForClass(PaperQuestion);

@Schema({ _id: false })
export class PaperAnswerKey {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  originalQuestionId: Types.ObjectId;

  @Prop({ required: true })
  correctAnswerId: string;
}
const PaperAnswerKeySchema = SchemaFactory.createForClass(PaperAnswerKey);

@Schema({ timestamps: true, collection: 'exam_papers' })
export class ExamPaper {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Exam',
    required: true,
    index: true,
  })
  examId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'ExamSubmission',
    default: null,
    index: true,
  })
  submissionId?: Types.ObjectId;

  @Prop({ type: [PaperQuestionSchema], required: true })
  questions: PaperQuestion[];

  @Prop({ type: [PaperAnswerKeySchema], select: false, default: [] })
  answerKeys: PaperAnswerKey[];
}

export const ExamPaperSchema = SchemaFactory.createForClass(ExamPaper);

ExamPaperSchema.index({ examId: 1, submissionId: 1 });
