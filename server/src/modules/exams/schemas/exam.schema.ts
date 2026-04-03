import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { DifficultyLevel } from '../../questions/schemas/question.schema';

// [MAX PING]: Import Schema từ module Matrix để tái sử dụng
import { MatrixSectionSchema, MatrixSection } from './exam-matrix.schema';

export type ExamDocument = Exam & Document;

export enum ExamType {
  OFFICIAL = 'OFFICIAL',
  PRACTICE = 'PRACTICE',
  COURSE_QUIZ = 'COURSE_QUIZ',
}
export enum ExamMode {
  STATIC = 'STATIC',
  DYNAMIC = 'DYNAMIC',
}

@Schema({ _id: false })
export class DynamicFilter {
  @Prop({ type: String, enum: DifficultyLevel, required: true })
  difficulty: DifficultyLevel;

  @Prop({ required: true, min: 1 })
  count: number;
}
const DynamicFilterSchema = SchemaFactory.createForClass(DynamicFilter);

@Schema({ _id: false })
export class DynamicExamConfig {
  // ==========================================
  // [LEGACY FIELDS] - Giữ lại để tương thích ngược
  // ==========================================
  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'QuestionFolder' }],
    default: [],
  })
  sourceFolders?: Types.ObjectId[];

  @Prop({ type: [DynamicFilterSchema], default: [] })
  mixRatio?: DynamicFilter[];

  // ==========================================
  // [NEW MATRIX FIELDS] - Cấu trúc Coursera/Udemy
  // ==========================================
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'ExamMatrix',
    default: null,
  })
  matrixId?: Types.ObjectId;

  @Prop({ type: [MatrixSectionSchema], default: [] })
  adHocSections?: MatrixSection[];
}
const DynamicExamConfigSchema = SchemaFactory.createForClass(DynamicExamConfig);

@Schema({ timestamps: true, collection: 'exams' })
export class Exam {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  teacherId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true,
  })
  subjectId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  totalScore: number;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ type: String, enum: ExamType, default: ExamType.PRACTICE })
  type: ExamType;

  @Prop({ type: String, enum: ExamMode, default: ExamMode.STATIC })
  mode: ExamMode;

  @Prop({ type: DynamicExamConfigSchema, default: null })
  dynamicConfig?: DynamicExamConfig;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'QuestionFolder',
    default: null,
  })
  folderId?: Types.ObjectId;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);
ExamSchema.index({ teacherId: 1, subjectId: 1 });
