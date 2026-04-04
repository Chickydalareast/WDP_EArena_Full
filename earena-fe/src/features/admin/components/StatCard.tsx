'use client';

import { ReactNode } from 'react';

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">{value}</div>
          {hint ? <div className="mt-2 text-xs text-muted-foreground">{hint}</div> : null}
        </div>
        {icon ? (
          <div className="size-10 rounded-xl border border-border bg-accent/60 flex items-center justify-center">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
