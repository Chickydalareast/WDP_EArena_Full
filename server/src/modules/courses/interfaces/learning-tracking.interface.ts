export interface SyncHeartbeatPayload {
  userId: string;
  courseId: string;
  lessonId: string;
  delta: number;
  lastPosition: number;
  isEnded?: boolean;
}
