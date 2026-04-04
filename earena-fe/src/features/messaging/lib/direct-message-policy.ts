import { ROUTES } from '@/config/routes';

/** Học viên ↔ học viên hoặc học viên ↔ giáo viên (không hỗ trợ GV–GV, không hỗ trợ ADMIN). */
export function canDirectMessage(roleA: string | undefined, roleB: string | undefined): boolean {
  if (!roleA || !roleB) return false;
  if (roleA === 'ADMIN' || roleB === 'ADMIN') return false;
  const s = new Set([roleA, roleB]);
  if (s.has('STUDENT') && s.has('TEACHER')) return true;
  if (s.size === 1 && s.has('STUDENT')) return true;
  return false;
}

export function peerRoleLabel(role: string | undefined): string {
  if (role === 'TEACHER') return 'Giáo viên';
  if (role === 'STUDENT') return 'Học viên';
  return role || '';
}

/** URL hộp thư với peer; null nếu viewer không có inbox theo role. */
export function messagesInboxUrlForPeer(
  viewerRole: string | undefined,
  peerUserId: string,
): string | null {
  if (!viewerRole || viewerRole === 'ADMIN') return null;
  if (viewerRole !== 'STUDENT' && viewerRole !== 'TEACHER') return null;
  const base =
    viewerRole === 'TEACHER' ? ROUTES.TEACHER.MESSAGES : ROUTES.STUDENT.MESSAGES;
  return `${base}?peer=${encodeURIComponent(peerUserId)}`;
}
