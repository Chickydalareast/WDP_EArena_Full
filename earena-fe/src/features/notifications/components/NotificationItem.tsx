'use client';

import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { INotification } from '../types/notification.schema';
import { useNotificationStore } from '../stores/notification.store';
import { notificationService } from '../api/notification.service';
import { resolveNotificationPath } from '../lib/notification-navigation';

interface Props {
    data: INotification;
    closeDropdown: () => void;
}

export const NotificationItem = ({ data, closeDropdown }: Props) => {
    const router = useRouter();
    const markAsReadLocally = useNotificationStore((state) => state.markAsReadLocally);

    const handleClick = () => {
        const targetPath = resolveNotificationPath(data);

        // 1. Optimistic Update: Cập nhật UI thành "Đã đọc" ngay lập tức
        if (!data.isRead) {
            markAsReadLocally(data.id);

            // 2. Fire-and-forget: Bắn API xuống BE chạy ngầm (không await)
            notificationService.markAsRead(data.id).catch((err) => {
                console.error('[Notification] Lỗi đồng bộ trạng thái đọc:', err);
            });
        }

        // 3. Đóng popup
        closeDropdown();

        // 4. Navigate mượt mà bằng App Router (COMMUNITY: post + hash comment)
        if (targetPath) {
            router.push(targetPath);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                'group flex gap-3 p-4 cursor-pointer transition-all hover:bg-muted/50 border-l-4',
                data.isRead
                    ? 'bg-background border-transparent opacity-75'
                    : 'bg-primary/5 border-primary'
            )}
        >
            <div className="mt-1 flex-shrink-0">
                {data.isRead ? (
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                ) : (
                    <Circle className="w-5 h-5 text-primary fill-primary" />
                )}
            </div>

            <div className="flex-1 space-y-1 overflow-hidden">
                <h4 className={cn(
                    "text-sm font-medium leading-none tracking-tight",
                    !data.isRead && "text-foreground font-semibold"
                )}>
                    {data.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {data.message}
                </p>
                <p className="text-[10px] text-muted-foreground/80 font-medium">
                    {formatDistanceToNow(new Date(data.createdAt), { addSuffix: true, locale: vi })}
                </p>
            </div>
        </div>
    );
};