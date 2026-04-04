'use client';

import { cn } from '@/shared/lib/utils';

export type CommunityAttachment = {
  url: string;
  kind: 'IMAGE' | 'FILE';
  name?: string;
  mime?: string;
};

function normalizeAttachments(raw: unknown): CommunityAttachment[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (a): a is CommunityAttachment =>
      !!a &&
      typeof a === 'object' &&
      typeof (a as CommunityAttachment).url === 'string' &&
      ((a as CommunityAttachment).kind === 'IMAGE' ||
        (a as CommunityAttachment).kind === 'FILE'),
  );
}

export function PostAttachmentsDisplay({
  attachments,
  className,
}: {
  attachments: unknown;
  className?: string;
}) {
  const list = normalizeAttachments(attachments);
  if (!list.length) return null;

  const images = list.filter((a) => a.kind === 'IMAGE');
  const files = list.filter((a) => a.kind === 'FILE');

  return (
    <div className={cn('space-y-2', className)}>
      {images.length > 0 && (
        <div
          className={cn(
            'grid gap-2',
            images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-2',
          )}
        >
          {images.map((a, i) => (
            <a
              key={`${a.url}-${i}`}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-lg border border-border bg-muted/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.url}
                alt={a.name || 'Đính kèm'}
                className="max-h-72 w-full object-contain"
              />
            </a>
          ))}
        </div>
      )}
      {files.length > 0 && (
        <ul className="text-sm space-y-1">
          {files.map((a, i) => (
            <li key={`${a.url}-${i}`}>
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {a.name || 'Tệp đính kèm'}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
