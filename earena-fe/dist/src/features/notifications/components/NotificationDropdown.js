'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationDropdown = void 0;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const notification_store_1 = require("../stores/notification.store");
const notification_service_1 = require("../api/notification.service");
const NotificationItem_1 = require("./NotificationItem");
const dropdown_menu_1 = require("@/shared/components/ui/dropdown-menu");
const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const { notifications, unreadCount, markAllAsReadLocally } = (0, notification_store_1.useNotificationStore)();
    const handleMarkAllAsRead = (e) => {
        e.stopPropagation();
        if (unreadCount === 0)
            return;
        markAllAsReadLocally();
        notification_service_1.notificationService.markAllAsRead().catch((err) => {
            console.error('[Notification] Lỗi đánh dấu đọc tất cả:', err);
        });
    };
    return (<dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
                <button className="p-2 text-muted-foreground hover:text-primary transition rounded-full hover:bg-muted relative outline-none" aria-label="Thông báo">
                    <lucide_react_1.Bell size={20}/>
                    {unreadCount > 0 && (<span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-background">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>)}
                </button>
            </dropdown_menu_1.DropdownMenuTrigger>

            <dropdown_menu_1.DropdownMenuContent align="end" className="w-[320px] sm:w-[380px] p-0 shadow-xl overflow-hidden rounded-xl mt-2">
                <div className="flex items-center justify-between p-4 bg-muted/30">
                    <span className="font-semibold text-sm">Thông báo</span>
                    {unreadCount > 0 && (<button onClick={handleMarkAllAsRead} className="text-xs font-medium text-primary hover:underline">
                            Đánh dấu tất cả đã đọc
                        </button>)}
                </div>

                <dropdown_menu_1.DropdownMenuSeparator className="m-0"/>

                <div className="max-h-[400px] overflow-y-auto overscroll-contain flex flex-col custom-scrollbar">
                    {(notifications || []).length === 0 ? (<div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center">
                            <lucide_react_1.Bell className="w-10 h-10 text-muted/50 mb-3"/>
                            <p>Bạn chưa có thông báo nào.</p>
                        </div>) : ((notifications || []).map((notif) => (<NotificationItem_1.NotificationItem key={notif.id} data={notif} closeDropdown={() => setIsOpen(false)}/>)))}
                </div>

                {(notifications || []).length > 0 && (<>
                        <dropdown_menu_1.DropdownMenuSeparator className="m-0"/>
                        <div className="p-2 bg-muted/10 text-center">
                            <span className="text-xs text-muted-foreground font-medium">
                                Chỉ hiển thị các thông báo gần nhất
                            </span>
                        </div>
                    </>)}
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
};
exports.NotificationDropdown = NotificationDropdown;
//# sourceMappingURL=NotificationDropdown.js.map