import { ROUTES } from '@/config/routes';
import type { INotification } from '../types/notification.schema';

/** Đường dẫn nội bộ (App Router), có thể kèm hash #comment-... */
export function resolveNotificationPath(data: INotification): string | null {
  const p = data.payload || {};
  const rawUrl = typeof p.url === 'string' ? p.url.trim() : '';
  const postId = typeof p.postId === 'string' ? p.postId : undefined;
  const commentId = typeof p.commentId === 'string' ? p.commentId : undefined;

  let path: string | null = null;

  if (data.type === 'COMMUNITY') {
    if (postId) path = ROUTES.PUBLIC.COMMUNITY_POST(postId);
    else if (rawUrl.startsWith('/')) path = rawUrl;
    else path = ROUTES.PUBLIC.COMMUNITY;
  } else if (rawUrl.startsWith('/')) {
    path = rawUrl;
  }

  if (!path) return null;
  if (commentId && path.includes('/community/post/') && !path.includes('#')) {
    return `${path}#comment-${commentId}`;
  }
  return path;
}
