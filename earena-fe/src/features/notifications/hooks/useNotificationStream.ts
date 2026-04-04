'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { env } from '@/config/env';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { useNotificationStore } from '../stores/notification.store';
import { notificationService } from '../api/notification.service';
import { INotification, NOTIFICATION_TYPES } from '../types/notification.schema';
import { normalizeNotificationRecord } from '../lib/normalize-notification';

import { useQuestionBankStore } from '@/features/question-bank/stores/question-bank.store';
import { IAiBatchCompletedEvent } from '@/features/question-bank/types/question-bank.schema';

export const useNotificationStream = (isAuthenticated: boolean) => {
    const { setInitialData, addRealtimeNotification } = useNotificationStore();
    const isReconnecting = useRef(false);

    const fetchHistoryAndSync = async () => {
        try {
            const response = await notificationService.getHistory(1, 15);
            const rawItems = response.items || [];
            const safeData = rawItems
                .map((item) => normalizeNotificationRecord(item))
                .filter((n): n is INotification => n != null);

            setInitialData(safeData, response.meta?.unreadCount || 0);
        } catch (error) {
            console.error('[SSE] Lỗi khi đồng bộ lịch sử thông báo:', error);
        }
    };

    useEffect(() => {
        if (!isAuthenticated || typeof window === 'undefined') return;

        fetchHistoryAndSync();

        const streamUrl = `${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.NOTIFICATIONS.STREAM}`;
        const eventSource = new EventSource(streamUrl, { withCredentials: true });

        eventSource.onopen = () => {
            if (isReconnecting.current) {
                fetchHistoryAndSync();
                isReconnecting.current = false;
            }
        };

        const handleStreamData = (event: MessageEvent) => {
            if (!event.data) return;

            try {
                const rawData = JSON.parse(event.data); 

                if (!rawData || typeof rawData !== 'object' || !rawData.type) return;

                const newNotif = normalizeNotificationRecord(rawData);
                if (!newNotif) return;
                addRealtimeNotification(newNotif);

                if (newNotif.type === 'SYSTEM' && newNotif.payload?.metadata?.event === 'AUTO_TAG_BATCH_COMPLETED') {
                    const aiMeta = newNotif.payload.metadata as unknown as IAiBatchCompletedEvent;
                    
                    useQuestionBankStore.getState().processAiBatchEvent(
                        aiMeta.batchNum,
                        aiMeta.totalBatches,
                        aiMeta.processedQuestions
                    );
                    
                    return;
                }

                const payloadObj = newNotif.payload as Record<string, unknown> | undefined;
                const action = payloadObj?.action as string | undefined;

                if (newNotif.type === 'COURSE' && action?.startsWith('PROMPT_REVIEW')) {
                    window.dispatchEvent(new CustomEvent('core:prompt_review', {
                        detail: {
                            courseId: payloadObj?.courseId as string,
                            title: newNotif.title,
                            message: newNotif.message
                        }
                    }));
                    return;
                }

                if (newNotif.type !== 'SYSTEM' || !newNotif.payload?.metadata?.event) {
                    toast(newNotif.title || 'Thông báo mới', {
                        description: newNotif.message || '',
                        duration: 6000,
                    });
                }

            } catch (error) {
                console.error('[SSE] Lỗi Parse dữ liệu stream:', error);
            }
        };

        if (Array.isArray(NOTIFICATION_TYPES)) {
            NOTIFICATION_TYPES.forEach((type) => {
                eventSource.addEventListener(type, handleStreamData);
            });
        }

        eventSource.onmessage = handleStreamData;

        eventSource.onerror = () => {
            isReconnecting.current = true;
            if (eventSource.readyState === EventSource.CLOSED) {
                eventSource.close();
            }
        };

        return () => {
            if (Array.isArray(NOTIFICATION_TYPES)) {
                NOTIFICATION_TYPES.forEach((type) => {
                    eventSource.removeEventListener(type, handleStreamData);
                });
            }
            eventSource.close();
        };
    }, [isAuthenticated, setInitialData, addRealtimeNotification]);
};