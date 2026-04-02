import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { DifficultyLevel } from '../../questions/schemas/question.schema';

export type ExamMatrixDocument = ExamMatrix & Document;

@Schema({ _id: false })
export class MatrixRule {
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'QuestionFolder' }], default: [] })
  folderIds: Types.ObjectId[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'KnowledgeTopic' }], default: [] })
  topicIds: Types.ObjectId[];

  @Prop({ type: [String], enum: DifficultyLevel, default: [] })
  difficulties: DifficultyLevel[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true, min: 1 })
  limit: number;
}
export const MatrixRuleSchema = SchemaFactory.createForClass(MatrixRule);

@Schema({ _id: false })
export class MatrixSection {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: 0 })
  orderIndex: number;

  @Prop({ type: [MatrixRuleSchema], required: true })
  rules: MatrixRule[];
}
export const MatrixSectionSchema = SchemaFactory.createForClass(MatrixSection);

@Schema({ timestamps: true, collection: 'exam_matrices' })
export class ExamMatrix {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  teacherId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Subject', required: true, index: true })
  subjectId: Types.ObjectId;

  @Prop({ type: [MatrixSectionSchema], required: true })
  sections: MatrixSection[];
}

export const ExamMatrixSchema = SchemaFactory.createForClass(ExamMatrix);
ExamMatrixSchema.index({ teacherId: 1, subjectId: 1 });