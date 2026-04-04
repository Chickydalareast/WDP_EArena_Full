"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeNotificationRecord = normalizeNotificationRecord;
function iso(d) {
    if (d instanceof Date)
        return d.toISOString();
    if (typeof d === 'string' && d)
        return new Date(d).toISOString();
    return new Date().toISOString();
}
function normalizeNotificationRecord(raw) {
    if (!raw || typeof raw !== 'object')
        return null;
    const r = raw;
    const id = r.id ?? r._id;
    if (id == null || !r.type)
        return null;
    const payload = r.payload && typeof r.payload === 'object' && !Array.isArray(r.payload)
        ? r.payload
        : {};
    return {
        id: String(id),
        receiverId: String(r.receiverId ?? ''),
        senderId: r.senderId == null ? null : String(r.senderId),
        type: r.type,
        title: String(r.title ?? ''),
        message: String(r.message ?? ''),
        payload,
        isRead: Boolean(r.isRead),
        createdAt: iso(r.createdAt),
        updatedAt: iso(r.updatedAt ?? r.createdAt),
    };
}
//# sourceMappingURL=normalize-notification.js.map