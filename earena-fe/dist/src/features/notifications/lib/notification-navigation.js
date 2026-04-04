"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveNotificationPath = resolveNotificationPath;
const routes_1 = require("@/config/routes");
function resolveNotificationPath(data) {
    const p = data.payload || {};
    const rawUrl = typeof p.url === 'string' ? p.url.trim() : '';
    const postId = typeof p.postId === 'string' ? p.postId : undefined;
    const commentId = typeof p.commentId === 'string' ? p.commentId : undefined;
    let path = null;
    if (data.type === 'COMMUNITY') {
        if (postId)
            path = routes_1.ROUTES.PUBLIC.COMMUNITY_POST(postId);
        else if (rawUrl.startsWith('/'))
            path = rawUrl;
        else
            path = routes_1.ROUTES.PUBLIC.COMMUNITY;
    }
    else if (rawUrl.startsWith('/')) {
        path = rawUrl;
    }
    if (!path)
        return null;
    if (commentId && path.includes('/community/post/') && !path.includes('#')) {
        return `${path}#comment-${commentId}`;
    }
    return path;
}
//# sourceMappingURL=notification-navigation.js.map