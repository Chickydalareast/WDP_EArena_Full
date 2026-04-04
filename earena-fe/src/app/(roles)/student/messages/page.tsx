'use client';

import { Suspense } from 'react';
import { MessagesScreen } from '@/features/messaging/screens/MessagesScreen';

export default function StudentMessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Đang tải…</div>}>
      <MessagesScreen basePath="/student/messages" />
    </Suspense>
  );
}
