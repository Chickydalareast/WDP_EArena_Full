'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesNavIcon = MessagesNavIcon;
const link_1 = __importDefault(require("next/link"));
const lucide_react_1 = require("lucide-react");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const useMessagingUnreadCount_1 = require("../hooks/useMessagingUnreadCount");
function MessagesNavIcon({ href, role }) {
    const { user } = (0, auth_store_1.useAuthStore)();
    const enabled = !!user && user.role === role;
    const { data } = (0, useMessagingUnreadCount_1.useMessagingUnreadCount)(enabled);
    const count = data?.count ?? 0;
    return (<link_1.default href={href} className="relative p-2 text-muted-foreground hover:text-primary transition rounded-full hover:bg-muted outline-none" title="Tin nhắn">
      <lucide_react_1.MessageSquare size={20}/>
      {count > 0 ? (<span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground flex items-center justify-center border-2 border-background leading-none">
          {count > 99 ? '99+' : count}
        </span>) : null}
    </link_1.default>);
}
//# sourceMappingURL=MessagesNavIcon.js.map