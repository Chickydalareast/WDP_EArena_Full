'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagingUnreadQueryKey = void 0;
exports.useMessagingUnreadCount = useMessagingUnreadCount;
const react_query_1 = require("@tanstack/react-query");
const messaging_api_1 = require("../api/messaging-api");
exports.messagingUnreadQueryKey = ['messaging', 'unread-count'];
function useMessagingUnreadCount(enabled) {
    return (0, react_query_1.useQuery)({
        queryKey: exports.messagingUnreadQueryKey,
        queryFn: messaging_api_1.getUnreadCount,
        enabled,
        refetchInterval: 30_000,
    });
}
//# sourceMappingURL=useMessagingUnreadCount.js.map