import { z } from 'zod';
export declare const NOTIFICATION_TYPES: readonly ["SYSTEM", "COURSE", "EXAM", "FINANCE", "COMMUNITY"];
export declare const NotificationTypeEnum: any;
export type NotificationType = z.infer<typeof NotificationTypeEnum>;
export declare const NotificationPayloadSchema: any;
export declare const NotificationSchema: any;
export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;
export type INotification = z.infer<typeof NotificationSchema>;
