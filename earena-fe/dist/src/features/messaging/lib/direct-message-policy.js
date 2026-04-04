"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canDirectMessage = canDirectMessage;
exports.peerRoleLabel = peerRoleLabel;
exports.messagesInboxUrlForPeer = messagesInboxUrlForPeer;
const routes_1 = require("@/config/routes");
function canDirectMessage(roleA, roleB) {
    if (!roleA || !roleB)
        return false;
    if (roleA === 'ADMIN' || roleB === 'ADMIN')
        return false;
    const s = new Set([roleA, roleB]);
    if (s.has('STUDENT') && s.has('TEACHER'))
        return true;
    if (s.size === 1 && s.has('STUDENT'))
        return true;
    return false;
}
function peerRoleLabel(role) {
    if (role === 'TEACHER')
        return 'Giáo viên';
    if (role === 'STUDENT')
        return 'Học viên';
    return role || '';
}
function messagesInboxUrlForPeer(viewerRole, peerUserId) {
    if (!viewerRole || viewerRole === 'ADMIN')
        return null;
    if (viewerRole !== 'STUDENT' && viewerRole !== 'TEACHER')
        return null;
    const base = viewerRole === 'TEACHER' ? routes_1.ROUTES.TEACHER.MESSAGES : routes_1.ROUTES.STUDENT.MESSAGES;
    return `${base}?peer=${encodeURIComponent(peerUserId)}`;
}
//# sourceMappingURL=direct-message-policy.js.map