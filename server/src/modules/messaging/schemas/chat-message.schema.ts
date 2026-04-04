import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ timestamps: true, collection: 'chat_messages' })
export class ChatMessage {
  @Prop({ type: Types.ObjectId, ref: 'ChatThread', required: true, index: true })
  threadId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  senderId: Types.ObjectId;

  @Prop({ trim: true, maxlength: 8000 })
  body?: string;

  @Prop({ type: [String], default: [] })
  imageUrls: string[];

  @Prop({ type: Types.ObjectId, ref: 'Course' })
  shareCourseId?: Types.ObjectId;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

ChatMessageSchema.index({ threadId: 1, createdAt: 1 });
