import type { UserSession } from '../stores/auth.store';

type UserLike = Pick<UserSession, 'role' | 'teacherVerificationStatus'>;

/** Sau đăng nhập / đăng ký: giáo viên chưa VERIFIED → trang chờ duyệt */
export function getPostAuthLandingPath(user: UserLike): string {
  if (user.role === 'TEACHER' && user.teacherVerificationStatus !== 'VERIFIED') {
    return '/waiting-approval';
  }
  switch (user.role) {
    case 'STUDENT':
      return '/student';
    case 'ADMIN':
      return '/admin';
    case 'TEACHER':
    default:
      return '/teacher';
  }
}

export function resolvePostAuthRoute(user: UserLike, callbackUrl: string | null): string {
  if (user.role === 'TEACHER' && user.teacherVerificationStatus !== 'VERIFIED') {
    return '/waiting-approval';
  }
  if (callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
    return callbackUrl;
  }
  return getPostAuthLandingPath(user);
}
