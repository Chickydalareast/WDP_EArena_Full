import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt, JWTPayload } from 'jose';
import { ROUTES, ROLE_ROOT_PATHS } from '@/config/routes';

const isTokenExpired = (payload: JWTPayload): boolean => {
  if (!payload.exp) return true;
  return payload.exp * 1000 <= Date.now();
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  /** Chỉ các trang đăng nhập/đăng ký — không gồm /waiting-approval (tránh redirect vòng) */
  const authRoutes = [ROUTES.AUTH.LOGIN, ROUTES.AUTH.REGISTER, ROUTES.AUTH.FORGOT_PASSWORD];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  
  const isStudentRoute = pathname.startsWith(ROUTES.STUDENT.DASHBOARD);
  const isTeacherRoute = pathname.startsWith(ROUTES.TEACHER.DASHBOARD);
  const isAdminRoute = ROUTES.ADMIN ? pathname.startsWith(ROUTES.ADMIN.DASHBOARD) : pathname.startsWith('/admin');
  
  const isProtectedRoute = isStudentRoute || isTeacherRoute || isAdminRoute;

  let isTokenValid = false;
  let userRole: string | null = null;
  let teacherVerificationStatus: string | undefined;

  if (accessToken) {
    try {
      const tokenPayload = decodeJwt(accessToken);
      if (!isTokenExpired(tokenPayload)) {
        isTokenValid = true;
        userRole = tokenPayload.role as string;
        teacherVerificationStatus = tokenPayload.tvs as string | undefined;
      }
    } catch (error) {
      isTokenValid = false;
    }
  }

  const isTeacherVerified =
    userRole !== 'TEACHER' || teacherVerificationStatus === 'VERIFIED';
  const isWaitingApprovalRoute = pathname.startsWith(ROUTES.AUTH.WAITING_APPROVAL);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-is-auth', isTokenValid ? 'true' : 'false');
  
  if (userRole) {
    requestHeaders.set('x-user-role', userRole);
  }

  const nextConfig = {
    request: {
      headers: requestHeaders,
    },
  };

  if (isWaitingApprovalRoute && isTokenValid && userRole === 'TEACHER' && isTeacherVerified) {
    return NextResponse.redirect(new URL(ROLE_ROOT_PATHS.TEACHER, request.url));
  }

  if (isAuthRoute) {
    if (isTokenValid && userRole) {
      let targetRoute: string =
        userRole === 'ADMIN'
          ? ROLE_ROOT_PATHS.ADMIN || '/admin'
          : userRole === 'STUDENT'
            ? ROLE_ROOT_PATHS.STUDENT
            : ROLE_ROOT_PATHS.TEACHER;

      if (userRole === 'TEACHER' && !isTeacherVerified) {
        targetRoute = ROUTES.AUTH.WAITING_APPROVAL;
      }

      return NextResponse.redirect(new URL(targetRoute, request.url));
    }

    if (!isTokenValid && !refreshToken) {
      return NextResponse.next();
    }

    if (!isTokenValid && refreshToken) {
      return NextResponse.next();
    }
  }

  if (isProtectedRoute) {
    if (!isTokenValid && !refreshToken) {
      const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      
      const response = NextResponse.redirect(loginUrl);
      return response;
    }

    if (isTokenValid && userRole) {
      if (userRole === 'TEACHER' && !isTeacherVerified && isTeacherRoute) {
        return NextResponse.redirect(new URL(ROUTES.AUTH.WAITING_APPROVAL, request.url));
      }

      if (isStudentRoute && userRole !== 'STUDENT') {
        const fallback =
          userRole === 'ADMIN'
            ? ROLE_ROOT_PATHS.ADMIN || '/admin'
            : userRole === 'TEACHER' && !isTeacherVerified
              ? ROUTES.AUTH.WAITING_APPROVAL
              : ROLE_ROOT_PATHS.TEACHER;
        return NextResponse.redirect(new URL(fallback, request.url));
      }

      if (isTeacherRoute && userRole !== 'TEACHER') {
        const fallback = userRole === 'ADMIN' ? (ROLE_ROOT_PATHS.ADMIN || '/admin') : ROLE_ROOT_PATHS.STUDENT;
        return NextResponse.redirect(new URL(fallback, request.url));
      }

      if (isAdminRoute && userRole !== 'ADMIN') {
        const fallback =
          userRole === 'TEACHER'
            ? isTeacherVerified
              ? ROLE_ROOT_PATHS.TEACHER
              : ROUTES.AUTH.WAITING_APPROVAL
            : ROLE_ROOT_PATHS.STUDENT;
        return NextResponse.redirect(new URL(fallback, request.url));
      }
    }
  }

  return NextResponse.next(nextConfig);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};