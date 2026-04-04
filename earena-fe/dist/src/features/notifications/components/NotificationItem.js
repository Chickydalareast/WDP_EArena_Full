'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationItem = void 0;
const navigation_1 = require("next/navigation");
const date_fns_1 = require("date-fns");
const vi_1 = require("date-fns/locale/vi");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
const notification_store_1 = require("../stores/notification.store");
const notification_service_1 = require("../api/notification.service");
const notification_navigation_1 = require("../lib/notification-navigation");
const NotificationItem = ({ data, closeDropdown }) => {
    const router = (0, navigation_1.useRouter)();
    const markAsReadLocally = (0, notification_store_1.useNotificationStore)((state) => state.markAsReadLocally);
    const handleClick = () => {
        const targetPath = (0, notification_navigation_1.resolveNotificationPath)(data);
        if (!data.isRead) {
            markAsReadLocally(data.id);
            notification_service_1.notificationService.markAsRead(data.id).catch((err) => {
                console.error('[Notification] Lỗi đồng bộ trạng thái đọc:', err);
            });
        }
        closeDropdown();
        if (targetPath) {
            router.push(targetPath);
        }
    };
    return (<div onClick={handleClick} className={(0, utils_1.cn)('group flex gap-3 p-4 cursor-pointer transition-all hover:bg-muted/50 border-l-4', data.isRead
            ? 'bg-background border-transparent opacity-75'
            : 'bg-primary/5 border-primary')}>
            <div className="mt-1 flex-shrink-0">
                {data.isRead ? (<lucide_react_1.CheckCircle2 className="w-5 h-5 text-muted-foreground"/>) : (<lucide_react_1.Circle className="w-5 h-5 text-primary fill-primary"/>)}
            </div>

            <div className="flex-1 space-y-1 overflow-hidden">
                <h4 className={(0, utils_1.cn)("text-sm font-medium leading-none tracking-tight", !data.isRead && "text-foreground font-semibold")}>
                    {data.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {data.message}
                </p>
                <p className="text-[10px] text-muted-foreground/80 font-medium">
                    {(0, date_fns_1.formatDistanceToNow)(new Date(data.createdAt), { addSuffix: true, locale: vi_1.vi })}
                </p>
            </div>
        </div>);
};
exports.NotificationItem = NotificationItem;
//# sourceMappingURL=NotificationItem.js.map