'use client';

import { useQuery } from '@tanstack/react-query';
import { getUnreadCount } from '../api/messaging-api';

export const messagingUnreadQueryKey = ['messaging', 'unread-count'] as const;

export function useMessagingUnreadCount(enabled: boolean) {
  return useQuery({
    queryKey: messagingUnreadQueryKey,
    queryFn: getUnreadCount,
    enabled,
    refetchInterval: 30_000,
  });
}
