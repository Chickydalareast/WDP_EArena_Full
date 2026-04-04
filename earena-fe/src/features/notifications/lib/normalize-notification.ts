import type { INotification } from '../types/notification.schema';

type Raw = Record<string, unknown>;

function iso(d: unknown): string {
  if (d instanceof Date) return d.toISOString();
  if (typeof d === 'string' && d) return new Date(d).toISOString();
  return new Date().toISOString();
}

/** Chuẩn hoá document từ API / SSE (Mongo _id, payload lỏng) → INotification */
export function normalizeNotificationRecord(raw: unknown): INotification | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Raw;
  const id = r.id ?? r._id;
  if (id == null || !r.type) return null;
  const payload =
    r.payload && typeof r.payload === 'object' && !Array.isArray(r.payload)
      ? (r.payload as INotification['payload'])
      : {};

  return {
    id: String(id),
    receiverId: String(r.receiverId ?? ''),
    senderId: r.senderId == null ? null : String(r.senderId),
    type: r.type as INotification['type'],
    title: String(r.title ?? ''),
    message: String(r.message ?? ''),
    payload,
    isRead: Boolean(r.isRead),
    createdAt: iso(r.createdAt),
    updatedAt: iso(r.updatedAt ?? r.createdAt),
  };
}
