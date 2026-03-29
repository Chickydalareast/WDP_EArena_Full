'use client';

import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/features/notifications/stores/notification.store';
import { useQuestionBankStore } from '../stores/question-bank.store';
import { IAiBatchCompletedEvent } from '../types/question-bank.schema';

const isAiBatchEvent = (metadata: unknown): metadata is IAiBatchCompletedEvent => {
    if (!metadata || typeof metadata !== 'object') return false;
    const safeMeta = metadata as Record<string, unknown>;
    return safeMeta.event === 'AUTO_TAG_BATCH_COMPLETED';
};

export const useAiAutoTagListener = () => {
    const notifications = useNotificationStore(state => state.notifications);
    const processAiBatchEvent = useQuestionBankStore(state => state.processAiBatchEvent);
    
    const processedNotifIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!notifications || notifications.length === 0) return;

        const unhandledNotifications = notifications.filter(
            notif => !processedNotifIds.current.has(notif.id)
        );

        unhandledNotifications.forEach(notif => {
            processedNotifIds.current.add(notif.id);

            const metadata = notif.payload?.metadata;
            if (isAiBatchEvent(metadata)) {
                processAiBatchEvent(
                    metadata.batchNum, 
                    metadata.totalBatches, 
                    metadata.processedQuestions
                );
            }
        });
    }, [notifications, processAiBatchEvent]);
};