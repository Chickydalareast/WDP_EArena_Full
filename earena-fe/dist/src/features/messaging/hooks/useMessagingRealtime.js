'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMessagingRealtime = useMessagingRealtime;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const useMessagingUnreadCount_1 = require("./useMessagingUnreadCount");
const THREADS_KEY = ['messaging', 'threads'];
function messagesKey(threadId) {
    return ['messaging', 'messages', threadId];
}
function useMessagingRealtime(isAuthenticated) {
    const qc = (0, react_query_1.useQueryClient)();
    (0, react_1.useEffect)(() => {
        if (!isAuthenticated || typeof window === 'undefined')
            return;
        const handler = (e) => {
            const detail = e.detail;
            if (!detail?.threadId || !detail.message?.id)
                return;
            const { threadId, message } = detail;
            qc.setQueryData(messagesKey(threadId), (old) => {
                if (!old?.items?.length)
                    return old;
                if (old.items.some((m) => m.id === message.id))
                    return old;
                return {
                    ...old,
                    items: [...old.items, message],
                    meta: { ...old.meta, total: (old.meta?.total ?? old.items.length) + 1 },
                };
            });
            qc.invalidateQueries({ queryKey: THREADS_KEY });
            qc.invalidateQueries({ queryKey: useMessagingUnreadCount_1.messagingUnreadQueryKey });
        };
        window.addEventListener('messaging:chat_message', handler);
        return () => window.removeEventListener('messaging:chat_message', handler);
    }, [isAuthenticated, qc]);
}
//# sourceMappingURL=useMessagingRealtime.js.map