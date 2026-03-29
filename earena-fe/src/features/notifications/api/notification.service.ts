import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { INotification } from '../types/notification.schema';

export const notificationKeys = {
    all: ['notifications'] as const,
    lists: () => [...notificationKeys.all, 'list'] as const,
};

export interface NotificationHistoryResponse {
    items: any[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        unreadCount: number;
    };
}
export const notificationService = {
    getHistory: async (page = 1, limit = 10): Promise<NotificationHistoryResponse> => {
        return axiosClient.get(API_ENDPOINTS.NOTIFICATIONS.BASE, {
            params: { page, limit },
        });
    },

    markAsRead: async (id: string): Promise<{ message: string }> => {
        return axiosClient.patch(API_ENDPOINTS.NOTIFICATIONS.READ(id));
    },

    markAllAsRead: async (): Promise<{ message: string }> => {
        return axiosClient.patch(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
    },
};