'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ChatMessageItem } from '../api/messaging-api';
import { messagingUnreadQueryKey } from './useMessagingUnreadCount';

const THREADS_KEY = ['messaging', 'threads'] as const;

function messagesKey(threadId: string) {
  return ['messaging', 'messages', threadId] as const;
}

type ChatSsePayload = {
  threadId: string;
  message: ChatMessageItem;
};

/**
 * Đồng bộ tin nhắn realtime qua SSE (event CHAT_MESSAGE trên /notifications/stream).
 */
export function useMessagingRealtime(isAuthenticated: boolean) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return;

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ChatSsePayload>).detail;
      if (!detail?.threadId || !detail.message?.id) return;

      const { threadId, message } = detail;

      qc.setQueryData<{ items: ChatMessageItem[]; meta: { total: number } }>(
        messagesKey(threadId),
        (old) => {
          if (!old?.items?.length) return old;
          if (old.items.some((m) => m.id === message.id)) return old;
          return {
            ...old,
            items: [...old.items, message],
            meta: { ...old.meta, total: (old.meta?.total ?? old.items.length) + 1 },
          };
        },
      );

      qc.invalidateQueries({ queryKey: THREADS_KEY });
      qc.invalidateQueries({ queryKey: messagingUnreadQueryKey });
    };

    window.addEventListener('messaging:chat_message', handler);
    return () => window.removeEventListener('messaging:chat_message', handler);
  }, [isAuthenticated, qc]);
}
