'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useMessagingUnreadCount } from '../hooks/useMessagingUnreadCount';

type Role = 'STUDENT' | 'TEACHER';

export function MessagesNavIcon({ href, role }: { href: string; role: Role }) {
  const { user } = useAuthStore();
  const enabled = !!user && user.role === role;
  const { data } = useMessagingUnreadCount(enabled);
  const count = data?.count ?? 0;

  return (
    <Link
      href={href}
      className="relative p-2 text-muted-foreground hover:text-primary transition rounded-full hover:bg-muted outline-none"
      title="Tin nhắn"
    >
      <MessageSquare size={20} />
      {count > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground flex items-center justify-center border-2 border-background leading-none">
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  );
}
