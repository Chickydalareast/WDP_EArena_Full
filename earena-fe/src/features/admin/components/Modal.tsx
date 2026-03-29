'use client';

import { useEffect } from 'react';

export function Modal({
  open,
  title,
  children,
  footer,
  onClose,
  widthClassName = 'max-w-[640px]',
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  widthClassName?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className={
        'relative w-full ' +
        widthClassName +
        ' rounded-3xl border border-border bg-card shadow-xl'
      }>
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <div className="text-lg font-extrabold tracking-tight text-foreground">{title}</div>
          </div>
          <button
            className="rounded-2xl border border-border bg-background/60 px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>

        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
