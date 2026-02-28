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

@Schema({ _id: false }) 
export class AnswerOption {
  @Prop({ required: true }) id: string; 
  @Prop({ required: true }) content: string;
  @Prop({ required: true }) isCorrect: boolean; 
}
const AnswerOptionSchema = SchemaFactory.createForClass(AnswerOption);

@Schema({ timestamps: true, collection: 'questions' })
export class Question {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true }) 
  ownerId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'QuestionFolder', required: true, index: true }) 
  folderId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'KnowledgeTopic', required: true }) 
  topicId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Question', default: null }) 
  parentPassageId: Types.ObjectId;

  @Prop({ required: true }) 
  content: string; 

  @Prop({ type: [AnswerOptionSchema], default: [] }) 
  answers: AnswerOption[];

  @Prop({ type: String, enum: DifficultyLevel, default: DifficultyLevel.UNKNOWN, index: true }) 
  difficultyLevel: DifficultyLevel;

  @Prop({ type: [String], default: [], index: true }) 
  tags: string[];

  @Prop({ default: false }) 
  isArchived: boolean;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

QuestionSchema.index({ folderId: 1, topicId: 1, difficultyLevel: 1 });
QuestionSchema.index({ ownerId: 1, tags: 1 });