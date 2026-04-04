'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Loader2, MessageCircle, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { ROUTES } from '@/config/routes';
import { toast } from 'sonner';
import {
  getCommunityProfile,
  followCommunity,
  unfollowCommunity,
} from '../api/community-api';
import { formatCommunityBadges } from '../lib/community-badge-labels';
import {
  canDirectMessage,
  messagesInboxUrlForPeer,
  peerRoleLabel,
} from '@/features/messaging/lib/direct-message-policy';
import { useCommunityFloatingChatOptional } from './CommunityFloatingChatShell';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  /** Hiển thị tạm trong lúc fetch */
  displayNameHint?: string;
};

export function CommunityUserProfileDialog({
  open,
  onOpenChange,
  userId,
  displayNameHint,
}: Props) {
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const floatingChat = useCommunityFloatingChatOptional();

  const q = useQuery({
    queryKey: ['community-profile', userId],
    queryFn: () => getCommunityProfile(userId!),
    enabled: open && !!userId,
  });

  const data = q.data as {
    user?: { fullName?: string; id?: string; role?: string };
    community?: { reputation?: number; badges?: string[] };
    following?: boolean;
  } | undefined;

  const fullProfileHref = userId ? ROUTES.PUBLIC.COMMUNITY_PROFILE(userId) : null;

  const toggleFollow = async () => {
    if (!userId || !data?.user) return;
    try {
      if (data.following) {
        await unfollowCommunity('USER', userId);
        toast.success('Đã bỏ theo dõi');
      } else {
        await followCommunity('USER', userId);
        toast.success('Đã theo dõi');
      }
      await qc.invalidateQueries({ queryKey: ['community-profile', userId] });
      q.refetch();
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  const peerRole = data?.user?.role;
  const dmHref =
    isAuthenticated &&
    me?.id &&
    userId &&
    me.id !== userId &&
    me.role &&
    peerRole &&
    canDirectMessage(me.role, peerRole)
      ? messagesInboxUrlForPeer(me.role, userId)
      : null;

  const loginReturnHref =
    ROUTES.AUTH.LOGIN +
    '?callbackUrl=' +
    encodeURIComponent(fullProfileHref || ROUTES.PUBLIC.COMMUNITY);

  const showName = data?.user?.fullName || displayNameHint || 'Thành viên';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 pr-8">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {showName.charAt(0) || '?'}
            </span>
            <span className="text-left leading-tight">{showName}</span>
          </DialogTitle>
          <DialogDescription className="text-left space-y-1 pt-1">
            {q.isLoading ? (
              <span className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                Đang tải hồ sơ…
              </span>
            ) : data?.user ? (
              <>
                {peerRole ? (
                  <span className="block text-sm text-muted-foreground">
                    {peerRoleLabel(peerRole)}
                  </span>
                ) : null}
                <span className="block text-sm text-muted-foreground">
                  Uy tín: {data.community?.reputation ?? 0} · Huy hiệu:{' '}
                  {formatCommunityBadges(data.community?.badges)}
                </span>
              </>
            ) : q.isError ? (
              <span className="text-sm text-destructive">Không tải được hồ sơ.</span>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {fullProfileHref ? (
            <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
              <Link href={fullProfileHref} onClick={() => onOpenChange(false)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Trang hồ sơ đầy đủ
              </Link>
            </Button>
          ) : null}
          {isAuthenticated && me?.id && userId && me.id !== userId && !q.isLoading && data?.user ? (
            <>
              <Button
                variant={data.following ? 'outline' : 'default'}
                size="sm"
                className="w-full sm:w-auto"
                onClick={toggleFollow}
              >
                {data.following ? 'Đang theo dõi' : 'Theo dõi'}
              </Button>
              {dmHref && userId ? (
                floatingChat ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      floatingChat.openWithPeer(userId, showName);
                      onOpenChange(false);
                    }}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Trò chuyện riêng
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" className="w-full sm:w-auto" asChild>
                    <Link href={dmHref} onClick={() => onOpenChange(false)}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Trò chuyện riêng
                    </Link>
                  </Button>
                )
              ) : null}
            </>
          ) : null}
          {!isAuthenticated && userId ? (
            <p className="text-sm text-muted-foreground w-full">
              <Link href={loginReturnHref} className="text-primary font-medium hover:underline">
                Đăng nhập
              </Link>{' '}
              để theo dõi và nhắn tin.
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
