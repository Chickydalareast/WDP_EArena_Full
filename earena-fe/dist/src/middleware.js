"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.middleware = middleware;
const server_1 = require("next/server");
const jose_1 = require("jose");
const routes_1 = require("@/config/routes");
const isTokenExpired = (payload) => {
    if (!payload.exp)
        return true;
    return payload.exp * 1000 <= Date.now();
};
function middleware(request) {
    const { pathname } = request.nextUrl;
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;
    const authRoutes = [routes_1.ROUTES.AUTH.LOGIN, routes_1.ROUTES.AUTH.REGISTER, routes_1.ROUTES.AUTH.FORGOT_PASSWORD];
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
    const isStudentRoute = pathname.startsWith(routes_1.ROUTES.STUDENT.DASHBOARD);
    const isTeacherRoute = pathname.startsWith(routes_1.ROUTES.TEACHER.DASHBOARD);
    const isAdminRoute = routes_1.ROUTES.ADMIN ? pathname.startsWith(routes_1.ROUTES.ADMIN.DASHBOARD) : pathname.startsWith('/admin');
    const isProtectedRoute = isStudentRoute || isTeacherRoute || isAdminRoute;
    let isTokenValid = false;
    let userRole = null;
    let teacherVerificationStatus;
    if (accessToken) {
        try {
            const tokenPayload = (0, jose_1.decodeJwt)(accessToken);
            if (!isTokenExpired(tokenPayload)) {
                isTokenValid = true;
                userRole = tokenPayload.role;
                teacherVerificationStatus = tokenPayload.tvs;
            }
        }
        catch (error) {
            isTokenValid = false;
        }
    }
    const isTeacherVerified = userRole !== 'TEACHER' || teacherVerificationStatus === 'VERIFIED';
    const isWaitingApprovalRoute = pathname.startsWith(routes_1.ROUTES.AUTH.WAITING_APPROVAL);
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
        return server_1.NextResponse.redirect(new URL(routes_1.ROLE_ROOT_PATHS.TEACHER, request.url));
    }
    if (isAuthRoute) {
        if (isTokenValid && userRole) {
            let targetRoute = userRole === 'ADMIN'
                ? routes_1.ROLE_ROOT_PATHS.ADMIN || '/admin'
                : userRole === 'STUDENT'
                    ? routes_1.ROLE_ROOT_PATHS.STUDENT
                    : routes_1.ROLE_ROOT_PATHS.TEACHER;
            if (userRole === 'TEACHER' && !isTeacherVerified) {
                targetRoute = routes_1.ROUTES.AUTH.WAITING_APPROVAL;
            }
            return server_1.NextResponse.redirect(new URL(targetRoute, request.url));
        }
        if (!isTokenValid && !refreshToken) {
            return server_1.NextResponse.next();
        }
        if (!isTokenValid && refreshToken) {
            return server_1.NextResponse.next();
        }
    }
    if (isProtectedRoute) {
        if (!isTokenValid && !refreshToken) {
            const loginUrl = new URL(routes_1.ROUTES.AUTH.LOGIN, request.url);
            const returnTo = `${pathname}${request.nextUrl.search || ''}`;
            loginUrl.searchParams.set('callbackUrl', returnTo);
            const response = server_1.NextResponse.redirect(loginUrl);
            return response;
        }
        if (isTokenValid && userRole) {
            if (userRole === 'TEACHER' && !isTeacherVerified && isTeacherRoute) {
                return server_1.NextResponse.redirect(new URL(routes_1.ROUTES.AUTH.WAITING_APPROVAL, request.url));
            }
            if (isStudentRoute && userRole !== 'STUDENT') {
                const fallback = userRole === 'ADMIN'
                    ? routes_1.ROLE_ROOT_PATHS.ADMIN || '/admin'
                    : userRole === 'TEACHER' && !isTeacherVerified
                        ? routes_1.ROUTES.AUTH.WAITING_APPROVAL
                        : routes_1.ROLE_ROOT_PATHS.TEACHER;
                return server_1.NextResponse.redirect(new URL(fallback, request.url));
            }
            if (isTeacherRoute && userRole !== 'TEACHER') {
                const fallback = userRole === 'ADMIN' ? (routes_1.ROLE_ROOT_PATHS.ADMIN || '/admin') : routes_1.ROLE_ROOT_PATHS.STUDENT;
                return server_1.NextResponse.redirect(new URL(fallback, request.url));
            }
            if (isAdminRoute && userRole !== 'ADMIN') {
                const fallback = userRole === 'TEACHER'
                    ? isTeacherVerified
                        ? routes_1.ROLE_ROOT_PATHS.TEACHER
                        : routes_1.ROUTES.AUTH.WAITING_APPROVAL
                    : routes_1.ROLE_ROOT_PATHS.STUDENT;
                return server_1.NextResponse.redirect(new URL(fallback, request.url));
            }
        }
    }
    return server_1.NextResponse.next(nextConfig);
}
exports.config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};
//# sourceMappingURL=middleware.js.map