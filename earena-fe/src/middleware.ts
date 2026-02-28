import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from 'jose';

const protectedRoutes = {
  student: '/student',
  teacher: '/teacher', 
};

const authRoutes = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = request.cookies.get('accessToken')?.value;

  if (token && authRoutes.some((route) => pathname.startsWith(route))) {
    try {
      const payload = decodeJwt(token);
      const role = payload.role as string;
      const targetRoute = role === 'STUDENT' ? protectedRoutes.student : protectedRoutes.teacher;
      return NextResponse.redirect(new URL(targetRoute, request.url));
    } catch (error) {
      // Token lỗi/giả mạo -> Xóa cookie và cho đi tiếp vào trang login
      const response = NextResponse.next();
      response.cookies.delete('accessToken');
      return response;
    }
  }

  // 3. Kịch bản 2: Truy cập Route Protect (student/teacher)
  const isStudentRoute = pathname.startsWith(protectedRoutes.student);
  const isTeacherRoute = pathname.startsWith(protectedRoutes.teacher);

  if (isStudentRoute || isTeacherRoute) {
    if (!token) {
      // Chưa login -> Đá về /login kèm callback URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const payload = decodeJwt(token);
      const role = payload.role as string;

      // Kiểm tra RBAC (Role-Based Access Control)
      if (isStudentRoute && role !== 'STUDENT') {
        return NextResponse.redirect(new URL(protectedRoutes.teacher, request.url));
      }
      
      if (isTeacherRoute && role !== 'TEACHER' && role !== 'ADMIN') {
        return NextResponse.redirect(new URL(protectedRoutes.student, request.url));
      }

    } catch (error) {
      // Token không hợp lệ -> Xóa và đá về login
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('accessToken');
      return response;
    }
  }

  // 4. Các route hợp lệ hoặc public -> Cho qua
  return NextResponse.next();
}

// Tối ưu hiệu năng: Chỉ chạy middleware ở các route cần thiết, bỏ qua static files, api, _next
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};