export declare const notificationKeys: {
    all: readonly ["notifications"];
    lists: () => readonly ["notifications", "list"];
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
export declare const notificationService: {
    getHistory: (page?: number, limit?: number) => Promise<NotificationHistoryResponse>;
    markAsRead: (id: string) => Promise<{
        message: string;
    }>;
    markAllAsRead: () => Promise<{
        message: string;
    }>;
};
