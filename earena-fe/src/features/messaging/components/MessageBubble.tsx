'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';
import { cn } from '@/shared/lib/utils';
import type { ChatMessageItem } from '../api/messaging-api';

function AvatarChip({
  name,
  avatar,
  size = 'md',
}: {
  name?: string;
  avatar?: string;
  size?: 'sm' | 'md';
}) {
  const map = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-9 w-9 text-sm',
  } as const;

  return avatar ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatar}
      alt={name || 'avatar'}
      className={cn('rounded-full object-cover ring-1 ring-border', map[size])}
    />
  ) : (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ring-1 ring-primary/15',
        map[size],
      )}
    >
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
}

export function MessageBubble({
  m,
  isMine = false,
  peerName,
  peerAvatar,
}: {
  m: ChatMessageItem;
  isMine?: boolean;
  peerName?: string;
  peerAvatar?: string;
}) {
  return (
    <div className={cn('flex items-end gap-2', isMine ? 'justify-end' : 'justify-start')}>
      {!isMine ? <AvatarChip name={peerName} avatar={peerAvatar} size="sm" /> : null}

      <div className="max-w-[82%] space-y-1">
        <div
          className={cn(
            'rounded-[22px] px-4 py-3 text-sm shadow-sm',
            isMine
              ? 'rounded-br-md bg-primary text-primary-foreground'
              : 'rounded-bl-md border bg-background text-foreground',
          )}
        >
          {m.body ? <p className="whitespace-pre-wrap break-words">{m.body}</p> : null}

          {m.imageUrls?.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {m.imageUrls.map((u) => (
                <a
                  key={u}
                  href={u}
                  target="_blank"
                  rel="noreferrer"
                  className="relative block h-32 w-32 overflow-hidden rounded-2xl border bg-muted sm:h-36 sm:w-36"
                >
                  <Image src={u} alt="" fill className="object-cover" unoptimized />
                </a>
              ))}
            </div>
          ) : null}

          {m.shareCourse ? (
            <Link
              href={ROUTES.PUBLIC.COURSE_DETAIL(m.shareCourse.slug)}
              className={cn(
                'mt-2 flex gap-3 rounded-2xl border p-2.5',
                isMine
                  ? 'border-primary-foreground/20 bg-primary-foreground/10'
                  : 'border-primary/20 bg-primary/5',
              )}
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                {m.shareCourse.coverUrl ? (
                  <Image
                    src={m.shareCourse.coverUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <div className="line-clamp-2 font-medium">{m.shareCourse.title}</div>
                <span
                  className={cn(
                    'text-xs',
                    isMine ? 'text-primary-foreground/90' : 'text-primary',
                  )}
                >
                  Mở khóa học →
                </span>
              </div>
            </Link>
          ) : null}
        </div>

        <div
          className={cn(
            'px-1 text-[11px] text-muted-foreground',
            isMine ? 'text-right' : 'text-left',
          )}
        >
          {new Date(m.createdAt).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {isMine ? (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
          Bạn
        </div>
      ) : null}
    </div>
  );
}
