import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Token extends Document {
  @Prop({ required: true, index: true })
  token: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['refresh'], default: 'refresh' })
  type: string;

 
  @Prop({ required: true, expires: 0 }) 
  expiresAt: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);

// Kế thừa Compound Index từ source cũ để tối ưu tốc độ tìm kiếm khi cần query cả 2 trường
TokenSchema.index({ userId: 1, token: 1 });