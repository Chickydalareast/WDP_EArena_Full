import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatThreadDocument = ChatThread & Document;

@Schema({ timestamps: true, collection: 'chat_threads' })
export class ChatThread {
  /** Luôn sort: toString(userLow) < toString(userHigh) để unique cặp. */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userLowId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userHighId: Types.ObjectId;

  @Prop({ default: () => new Date() })
  lastMessageAt: Date;

  /** Người gửi tin nhắn cuối (để tính unread cho phía còn lại). */
  @Prop({ type: Types.ObjectId, ref: 'User' })
  lastMessageSenderId?: Types.ObjectId;

  /** Mốc “đã xem đến đây” cho userLowId. */
  @Prop({ type: Date })
  readAtLow?: Date;

  /** Mốc “đã xem đến đây” cho userHighId. */
  @Prop({ type: Date })
  readAtHigh?: Date;
}

export const ChatThreadSchema = SchemaFactory.createForClass(ChatThread);

ChatThreadSchema.index({ userLowId: 1, userHighId: 1 }, { unique: true });
