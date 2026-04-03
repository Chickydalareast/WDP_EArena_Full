import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type QuestionDocument = Question & Document;

export enum DifficultyLevel {
  NB = 'NB',
  TH = 'TH',
  VD = 'VD',
  VDC = 'VDC',
  UNKNOWN = 'UNKNOWN',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  PASSAGE = 'PASSAGE',
  FILL_BLANK = 'FILL_BLANK',
  TRUE_FALSE = 'TRUE_FALSE',
}

@Schema({ _id: false })
export class AnswerOption {
  @Prop({ required: true }) id: string;
  @Prop({ required: true }) content: string;
  @Prop({ required: true }) isCorrect: boolean;
}
const AnswerOptionSchema = SchemaFactory.createForClass(AnswerOption);

@Schema({ timestamps: true, collection: 'questions' })
export class Question {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  ownerId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'QuestionFolder',
    required: true,
    index: true,
  })
  folderId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'KnowledgeTopic',
    default: null,
  })
  topicId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Question',
    default: null,
    index: true,
  })
  parentPassageId: Types.ObjectId;

  @Prop({
    type: String,
    enum: QuestionType,
    default: QuestionType.MULTIPLE_CHOICE,
    index: true,
  })
  type: QuestionType;

  @Prop({ required: true })
  content: string;

  @Prop({ type: String, default: null })
  explanation: string;

  @Prop({ type: Number, default: 0 })
  orderIndex: number;

  @Prop({ type: [AnswerOptionSchema], default: [] })
  answers: AnswerOption[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Media' }],
    default: [],
  })
  attachedMedia: Types.ObjectId[];

  @Prop({
    type: String,
    enum: DifficultyLevel,
    default: DifficultyLevel.UNKNOWN,
    index: true,
  })
  difficultyLevel: DifficultyLevel;

  @Prop({ type: [String], default: [], index: true })
  tags: string[];

  @Prop({ default: true, index: true })
  isDraft: boolean;

  @Prop({ default: false })
  isArchived: boolean;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

QuestionSchema.index({ folderId: 1, type: 1, isDraft: 1 });
QuestionSchema.index({ parentPassageId: 1, orderIndex: 1 });
