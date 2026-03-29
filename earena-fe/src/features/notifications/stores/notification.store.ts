import { create } from 'zustand';
import { INotification } from '../types/notification.schema';

interface NotificationState {
    notifications: INotification[];
    unreadCount: number;

    setInitialData: (data: INotification[], totalUnread: number) => void;
    addRealtimeNotification: (notif: INotification) => void;
    markAsReadLocally: (id: string) => void;
    markAllAsReadLocally: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,

    setInitialData: (data, totalUnread) =>
        set({
            notifications: data || [],
            unreadCount: totalUnread || 0
        }),

    addRealtimeNotification: (notif) =>
        set((state) => ({
            notifications: [notif, ...state.notifications],
            unreadCount: state.unreadCount + 1,
        })),

    markAsReadLocally: (id) =>
        set((state) => {
            const updated = state.notifications.map((n) =>
                n.id === id && !n.isRead ? { ...n, isRead: true } : n
            );

            const wasUnread = state.notifications.find((n) => n.id === id)?.isRead === false;

            return {
                notifications: updated,
                unreadCount: Math.max(0, state.unreadCount - (wasUnread ? 1 : 0)),
            };
        }),

    markAllAsReadLocally: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
            unreadCount: 0,
        })),
}));