import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type KnowledgeTopicDocument = KnowledgeTopic & Document;
@Schema({ timestamps: true, collection: 'knowledge_topics' })
export class KnowledgeTopic {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Subject', required: true, index: true }) subjectId: Types.ObjectId;
  @Prop({ required: true, trim: true }) name: string;
  @Prop({ required: true, min: 1, max: 3 }) level: number;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'KnowledgeTopic', default: null, index: true }) parentId: Types.ObjectId;
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'KnowledgeTopic' }], index: true }) ancestors: Types.ObjectId[];
}
export const KnowledgeTopicSchema = SchemaFactory.createForClass(KnowledgeTopic);