import { z } from 'zod';

export const NOTIFICATION_TYPES = ['SYSTEM', 'COURSE', 'EXAM', 'FINANCE'] as const;

export const NotificationTypeEnum = z.enum(NOTIFICATION_TYPES);

export type NotificationType = z.infer<typeof NotificationTypeEnum>;

export const NotificationPayloadSchema = z.object({
    url: z.string().optional(),
    courseId: z.string().optional(),
    lessonId: z.string().optional(),
    examId: z.string().optional(),
    submissionId: z.string().optional(),
    transactionId: z.string().optional(),
    requestId: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
});

export const NotificationSchema = z.object({
    id: z.string(),
    receiverId: z.string(),
    senderId: z.string().nullable(),
    type: NotificationTypeEnum,
    title: z.string(),
    message: z.string(),
    payload: NotificationPayloadSchema,
    isRead: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;
export type INotification = z.infer<typeof NotificationSchema>;