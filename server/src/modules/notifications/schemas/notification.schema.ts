import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { NotificationType } from '../constants/notification-event.constant';
import type { NotificationPayload } from '../interfaces/notification.interface';

@Schema({
    timestamps: true,
    collection: 'notifications',
    // Tối ưu hóa Mongoose ảo hóa ID
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class Notification extends Document {
    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true, index: true })
    receiverId: Types.ObjectId;

    // Nếu là hệ thống tự động gửi (ví dụ: Chấm điểm xong), senderId = null
    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', default: null })
    senderId: Types.ObjectId | null;

    @Prop({ type: String, enum: NotificationType, required: true, index: true })
    type: string;

    @Prop({ type: String, required: true })
    title: string;

    @Prop({ type: String, required: true })
    message: string;

    // Sử dụng Mixed Type nhưng được kiểm soát chặt bởi TypeScript Interface
    @Prop({ type: SchemaTypes.Mixed, default: {} })
    payload: NotificationPayload;

    @Prop({ type: Boolean, default: false })
    isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// [PERFORMANCE TUNE]: Compound index cực kỳ quan trọng cho truy vấn: "Lấy 10 thông báo chưa đọc mới nhất của User X"
NotificationSchema.index({ receiverId: 1, isRead: 1, createdAt: -1 });
// Index tự động dọn dẹp thông báo rác hệ thống (System Alert) sau 30 ngày để tiết kiệm dung lượng (Tùy chọn, đang comment lại để bạn quyết định)
// NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000, partialFilterExpression: { type: 'SYSTEM' } });