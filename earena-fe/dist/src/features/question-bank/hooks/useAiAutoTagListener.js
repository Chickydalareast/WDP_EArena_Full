'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAiAutoTagListener = void 0;
const react_1 = require("react");
const notification_store_1 = require("@/features/notifications/stores/notification.store");
const question_bank_store_1 = require("../stores/question-bank.store");
const isAiBatchEvent = (metadata) => {
    if (!metadata || typeof metadata !== 'object')
        return false;
    const safeMeta = metadata;
    return safeMeta.event === 'AUTO_TAG_BATCH_COMPLETED';
};
const useAiAutoTagListener = () => {
    const notifications = (0, notification_store_1.useNotificationStore)(state => state.notifications);
    const processAiBatchEvent = (0, question_bank_store_1.useQuestionBankStore)(state => state.processAiBatchEvent);
    const processedNotifIds = (0, react_1.useRef)(new Set());
    (0, react_1.useEffect)(() => {
        if (!notifications || notifications.length === 0)
            return;
        const unhandledNotifications = notifications.filter(notif => !processedNotifIds.current.has(notif.id));
        unhandledNotifications.forEach(notif => {
            processedNotifIds.current.add(notif.id);
            const metadata = notif.payload?.metadata;
            if (isAiBatchEvent(metadata)) {
                processAiBatchEvent(metadata.batchNum, metadata.totalBatches, metadata.processedQuestions);
            }
        });
    }, [notifications, processAiBatchEvent]);
};
exports.useAiAutoTagListener = useAiAutoTagListener;
//# sourceMappingURL=useAiAutoTagListener.js.map