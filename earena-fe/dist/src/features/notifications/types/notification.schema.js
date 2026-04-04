"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSchema = exports.NotificationPayloadSchema = exports.NotificationTypeEnum = exports.NOTIFICATION_TYPES = void 0;
const zod_1 = require("zod");
exports.NOTIFICATION_TYPES = ['SYSTEM', 'COURSE', 'EXAM', 'FINANCE', 'COMMUNITY'];
exports.NotificationTypeEnum = zod_1.z.enum(exports.NOTIFICATION_TYPES);
exports.NotificationPayloadSchema = zod_1.z.object({
    url: zod_1.z.string().optional(),
    courseId: zod_1.z.string().optional(),
    lessonId: zod_1.z.string().optional(),
    examId: zod_1.z.string().optional(),
    submissionId: zod_1.z.string().optional(),
    transactionId: zod_1.z.string().optional(),
    requestId: zod_1.z.string().optional(),
    postId: zod_1.z.string().optional(),
    commentId: zod_1.z.string().optional(),
    action: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
});
exports.NotificationSchema = zod_1.z.object({
    id: zod_1.z.string(),
    receiverId: zod_1.z.string(),
    senderId: zod_1.z.string().nullable(),
    type: exports.NotificationTypeEnum,
    title: zod_1.z.string(),
    message: zod_1.z.string(),
    payload: exports.NotificationPayloadSchema,
    isRead: zod_1.z.boolean(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
//# sourceMappingURL=notification.schema.js.map