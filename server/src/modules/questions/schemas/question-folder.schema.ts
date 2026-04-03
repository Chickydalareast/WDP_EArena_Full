import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type QuestionFolderDocument = QuestionFolder & Document;

@Schema({ timestamps: true, collection: 'question_folders' })
export class QuestionFolder {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true, default: '' })
  description: string;

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
    default: null,
    index: true,
  })
  parentId: Types.ObjectId | null;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'QuestionFolder' }],
    default: [],
    index: true,
  })
  ancestors: Types.ObjectId[];
}

export const QuestionFolderSchema =
  SchemaFactory.createForClass(QuestionFolder);

QuestionFolderSchema.index({ ownerId: 1, ancestors: 1 });
QuestionFolderSchema.index({ ownerId: 1, parentId: 1 });
