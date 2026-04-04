'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNotificationStream = void 0;
const react_1 = require("react");
const sonner_1 = require("sonner");
const env_1 = require("@/config/env");
const api_endpoints_1 = require("@/config/api-endpoints");
const notification_store_1 = require("../stores/notification.store");
const notification_service_1 = require("../api/notification.service");
const notification_schema_1 = require("../types/notification.schema");
const normalize_notification_1 = require("../lib/normalize-notification");
const question_bank_store_1 = require("@/features/question-bank/stores/question-bank.store");
const useNotificationStream = (isAuthenticated) => {
    const { setInitialData, addRealtimeNotification } = (0, notification_store_1.useNotificationStore)();
    const isReconnecting = (0, react_1.useRef)(false);
    const fetchHistoryAndSync = async () => {
        try {
            const response = await notification_service_1.notificationService.getHistory(1, 15);
            const rawItems = response.items || [];
            const safeData = rawItems
                .map((item) => (0, normalize_notification_1.normalizeNotificationRecord)(item))
                .filter((n) => n != null);
            setInitialData(safeData, response.meta?.unreadCount || 0);
        }
        catch (error) {
            console.error('[SSE] Lỗi khi đồng bộ lịch sử thông báo:', error);
        }
    };
    (0, react_1.useEffect)(() => {
        if (!isAuthenticated || typeof window === 'undefined')
            return;
        fetchHistoryAndSync();
        const streamUrl = `${env_1.env.NEXT_PUBLIC_API_URL}${api_endpoints_1.API_ENDPOINTS.NOTIFICATIONS.STREAM}`;
        const eventSource = new EventSource(streamUrl, { withCredentials: true });
        eventSource.onopen = () => {
            if (isReconnecting.current) {
                fetchHistoryAndSync();
                isReconnecting.current = false;
            }
        };
        const handleChatMessage = (event) => {
            if (!event.data)
                return;
            try {
                const rawData = JSON.parse(event.data);
                if (rawData?.threadId && rawData?.message?.id) {
                    window.dispatchEvent(new CustomEvent('messaging:chat_message', { detail: rawData }));
                }
            }
            catch {
            }
        };
        const handleStreamData = (event) => {
            if (!event.data)
                return;
            try {
                const rawData = JSON.parse(event.data);
                if (!rawData || typeof rawData !== 'object' || !rawData.type)
                    return;
                const newNotif = (0, normalize_notification_1.normalizeNotificationRecord)(rawData);
                if (!newNotif)
                    return;
                addRealtimeNotification(newNotif);
                if (newNotif.type === 'SYSTEM' && newNotif.payload?.metadata?.event === 'AUTO_TAG_BATCH_COMPLETED') {
                    const aiMeta = newNotif.payload.metadata;
                    question_bank_store_1.useQuestionBankStore.getState().processAiBatchEvent(aiMeta.batchNum, aiMeta.totalBatches, aiMeta.processedQuestions);
                    return;
                }
                const payloadObj = newNotif.payload;
                const action = payloadObj?.action;
                if (newNotif.type === 'COURSE' && action?.startsWith('PROMPT_REVIEW')) {
                    window.dispatchEvent(new CustomEvent('core:prompt_review', {
                        detail: {
                            courseId: payloadObj?.courseId,
                            title: newNotif.title,
                            message: newNotif.message
                        }
                    }));
                    return;
                }
                if (newNotif.type !== 'SYSTEM' || !newNotif.payload?.metadata?.event) {
                    (0, sonner_1.toast)(newNotif.title || 'Thông báo mới', {
                        description: newNotif.message || '',
                        duration: 6000,
                    });
                }
            }
            catch (error) {
                console.error('[SSE] Lỗi Parse dữ liệu stream:', error);
            }
        };
        if (Array.isArray(notification_schema_1.NOTIFICATION_TYPES)) {
            notification_schema_1.NOTIFICATION_TYPES.forEach((type) => {
                eventSource.addEventListener(type, handleStreamData);
            });
        }
        eventSource.addEventListener('CHAT_MESSAGE', handleChatMessage);
        eventSource.onmessage = handleStreamData;
        eventSource.onerror = () => {
            isReconnecting.current = true;
            if (eventSource.readyState === EventSource.CLOSED) {
                eventSource.close();
            }
        };
        return () => {
            if (Array.isArray(notification_schema_1.NOTIFICATION_TYPES)) {
                notification_schema_1.NOTIFICATION_TYPES.forEach((type) => {
                    eventSource.removeEventListener(type, handleStreamData);
                });
            }
            eventSource.removeEventListener('CHAT_MESSAGE', handleChatMessage);
            eventSource.close();
        };
    }, [isAuthenticated, setInitialData, addRealtimeNotification]);
};
exports.useNotificationStream = useNotificationStream;
//# sourceMappingURL=useNotificationStream.js.map