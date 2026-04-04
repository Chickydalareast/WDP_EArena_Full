'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../stores/notification.store';
import { notificationService } from '../api/notification.service';
import { NotificationItem } from './NotificationItem';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';

export const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAllAsReadLocally } = useNotificationStore();

    const handleMarkAllAsRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (unreadCount === 0) return;

        markAllAsReadLocally();

        notificationService.markAllAsRead().catch((err) => {
            console.error('[Notification] Lỗi đánh dấu đọc tất cả:', err);
        });
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className="p-2 text-muted-foreground hover:text-primary transition rounded-full hover:bg-muted relative outline-none"
                    aria-label="Thông báo"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-background">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[320px] sm:w-[380px] p-0 shadow-xl overflow-hidden rounded-xl mt-2">
                <div className="flex items-center justify-between p-4 bg-muted/30">
                    <span className="font-semibold text-sm">Thông báo</span>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs font-medium text-primary hover:underline"
                        >
                            Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </div>

                <DropdownMenuSeparator className="m-0" />

                <div className="max-h-[400px] overflow-y-auto overscroll-contain flex flex-col custom-scrollbar">
                    {(notifications || []).length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center">
                            <Bell className="w-10 h-10 text-muted/50 mb-3" />
                            <p>Bạn chưa có thông báo nào.</p>
                        </div>
                    ) : (
                        (notifications || []).map((notif) => (
                            <NotificationItem
                                key={notif.id}
                                data={notif}
                                closeDropdown={() => setIsOpen(false)}
                            />
                        ))
                    )}
                </div>

                {(notifications || []).length > 0 && (
                    <>
                        <DropdownMenuSeparator className="m-0" />
                        <div className="p-2 bg-muted/10 text-center">
                            <span className="text-xs text-muted-foreground font-medium">
                                Chỉ hiển thị các thông báo gần nhất
                            </span>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};