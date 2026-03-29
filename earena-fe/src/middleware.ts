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

  const authRoutes = Object.values(ROUTES.AUTH);
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  
  const isStudentRoute = pathname.startsWith(ROUTES.STUDENT.DASHBOARD);
  const isTeacherRoute = pathname.startsWith(ROUTES.TEACHER.DASHBOARD);
  const isAdminRoute = ROUTES.ADMIN ? pathname.startsWith(ROUTES.ADMIN.DASHBOARD) : pathname.startsWith('/admin');
  
  const isProtectedRoute = isStudentRoute || isTeacherRoute || isAdminRoute;

  let isTokenValid = false;
  let userRole: string | null = null;

  if (accessToken) {
    try {
      const tokenPayload = decodeJwt(accessToken);
      if (!isTokenExpired(tokenPayload)) {
        isTokenValid = true;
        userRole = tokenPayload.role as string;
      }
    } catch (error) {
      isTokenValid = false;
    }
  }

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

  if (isAuthRoute) {
    if (isTokenValid && userRole) {
      const targetRoute = userRole === 'ADMIN'
        ? (ROLE_ROOT_PATHS.ADMIN || '/admin')
        : userRole === 'STUDENT'
          ? ROLE_ROOT_PATHS.STUDENT
          : ROLE_ROOT_PATHS.TEACHER;
          
      return NextResponse.redirect(new URL(targetRoute, request.url));
    }
    
    if (!isTokenValid && refreshToken) {
      return NextResponse.redirect(new URL(ROLE_ROOT_PATHS.STUDENT, request.url));
    }
  }

  if (isProtectedRoute) {
    if (!isTokenValid && !refreshToken) {
      const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      
      const response = NextResponse.redirect(loginUrl);
      if (accessToken) response.cookies.delete('accessToken'); 
      return response;
    }

    if (isTokenValid && userRole) {
      if (isStudentRoute && userRole !== 'STUDENT') {
        const fallback = userRole === 'ADMIN' ? (ROLE_ROOT_PATHS.ADMIN || '/admin') : ROLE_ROOT_PATHS.TEACHER;
        return NextResponse.redirect(new URL(fallback, request.url));
      }

      if (isTeacherRoute && userRole !== 'TEACHER') {
        const fallback = userRole === 'ADMIN' ? (ROLE_ROOT_PATHS.ADMIN || '/admin') : ROLE_ROOT_PATHS.STUDENT;
        return NextResponse.redirect(new URL(fallback, request.url));
      }

      if (isAdminRoute && userRole !== 'ADMIN') {
        const fallback = userRole === 'TEACHER' ? ROLE_ROOT_PATHS.TEACHER : ROLE_ROOT_PATHS.STUDENT;
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