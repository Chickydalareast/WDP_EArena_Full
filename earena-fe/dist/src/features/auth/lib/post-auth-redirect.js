"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostAuthLandingPath = getPostAuthLandingPath;
exports.resolvePostAuthRoute = resolvePostAuthRoute;
function getPostAuthLandingPath(user) {
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
function resolvePostAuthRoute(user, callbackUrl) {
    if (user.role === 'TEACHER' && user.teacherVerificationStatus !== 'VERIFIED') {
        return '/waiting-approval';
    }
    if (callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
        return callbackUrl;
    }
    return getPostAuthLandingPath(user);
}
//# sourceMappingURL=post-auth-redirect.js.map