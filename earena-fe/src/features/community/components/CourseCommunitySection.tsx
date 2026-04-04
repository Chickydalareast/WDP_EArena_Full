'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';
import { getCommunityPostsByCourse } from '../api/community-api';
import { Card } from '@/shared/components/ui/card';
import { Loader2 } from 'lucide-react';

export function CourseCommunitySection({ courseId }: { courseId: string }) {
  const q = useQuery({
    queryKey: ['community-course-posts', courseId],
    queryFn: () => getCommunityPostsByCourse(courseId, { limit: 8 }),
  });

  const items = (q.data as { items?: { id: string; bodyPlain?: string }[] })?.items || [];

  return (
    <div className="space-y-4 pt-8 border-t border-border">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Thảo luận cộng đồng</h2>
        <Link
          href={ROUTES.PUBLIC.COMMUNITY}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Xem tất cả
        </Link>
      </div>
      {q.isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : !items.length ? (
        <p className="text-muted-foreground text-sm">
          Chưa có bài đăng nào về khóa học này. Hãy chia sẻ đầu tiên!
        </p>
      ) : (
        <div className="grid gap-2">
          {items.map((p) => (
            <Card key={p.id} className="p-3">
              <Link
                href={ROUTES.PUBLIC.COMMUNITY_POST(p.id)}
                className="text-sm font-medium text-primary hover:underline line-clamp-2"
              >
                {p.bodyPlain || 'Bài viết'}
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
