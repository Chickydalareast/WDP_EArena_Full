import type { NotificationType } from '../constants/notification-event.constant';

export interface NotificationPayload {
  url?: string;
  courseId?: string;
  lessonId?: string;
  examId?: string;
  submissionId?: string;
  transactionId?: string;
  requestId?: string;
  postId?: string;
  commentId?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateNotificationInput {
  receiverId: string;
  senderId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  payload?: NotificationPayload;
}
