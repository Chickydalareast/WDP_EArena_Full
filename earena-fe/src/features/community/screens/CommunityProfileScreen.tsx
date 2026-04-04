'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';
import { getCommunityProfile, followCommunity, unfollowCommunity } from '../api/community-api';
import { formatCommunityBadges } from '../lib/community-badge-labels';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Loader2, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { toast } from 'sonner';

export function CommunityProfileScreen({ userId }: { userId: string }) {
  const me = useAuthStore((s) => s.user);
  const q = useQuery({
    queryKey: ['community-profile', userId],
    queryFn: () => getCommunityProfile(userId),
  });

  const data = q.data as {
    user?: { fullName?: string; id?: string };
    community?: { reputation?: number; badges?: string[] };
    posts?: { id: string; bodyPlain?: string }[];
    following?: boolean;
  } | undefined;

  if (q.isLoading || !data?.user) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const toggleFollow = async () => {
    try {
      if (data.following) {
        await unfollowCommunity('USER', userId);
        toast.success('Đã bỏ theo dõi');
      } else {
        await followCommunity('USER', userId);
        toast.success('Đã theo dõi');
      }
      q.refetch();
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Card className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{data.user.fullName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Uy tín: {data.community?.reputation ?? 0} · Huy hiệu:{' '}
            {formatCommunityBadges(data.community?.badges)}
          </p>
        </div>
        {me?.id && me.id !== userId && (
          <div className="flex flex-wrap gap-2">
            <Button variant={data.following ? 'outline' : 'default'} onClick={toggleFollow}>
              {data.following ? 'Đang theo dõi' : 'Theo dõi'}
            </Button>
            <Button variant="secondary" asChild>
              <Link
                href={`${me.role === 'TEACHER' ? ROUTES.TEACHER.MESSAGES : ROUTES.STUDENT.MESSAGES}?peer=${userId}`}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Trò chuyện riêng
              </Link>
            </Button>
          </div>
        )}
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Bài đã đăng</h2>
        {(data.posts || []).map((p) => (
          <Card key={p.id} className="p-3">
            <Link
              href={ROUTES.PUBLIC.COMMUNITY_POST(p.id)}
              className="text-sm text-primary hover:underline line-clamp-2"
            >
              {p.bodyPlain}
            </Link>
          </Card>
        ))}
      </section>
    </div>
  );
}
