'use client';

import { useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Global Route Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
      <h2 className="text-3xl font-bold tracking-tight mb-3">Lỗi Hệ Thống Nghiêm Trọng</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        EArena đang gặp sự cố khi tải trang này. Chúng tôi đã ghi nhận lỗi. Vui lòng tải lại hoặc quay về trang chủ.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} size="lg">
          Tải lại trang
        </Button>
        <Button variant="secondary" onClick={() => window.location.href = '/'} size="lg">
          Về trang chủ
        </Button>
      </div>
    </div>
  );
}