'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import {
  Loader2,
  MessageCircle,
  UserRound,
  UserPlus,
  Check,
} from 'lucide-react';
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
import { cn } from '@/shared/lib/utils';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  /** Hiển thị tạm trong lúc fetch */
  displayNameHint?: string;
};

function roleHeadline(role: string | undefined): string {
  if (role === 'TEACHER') return 'GIÁO VIÊN';
  if (role === 'STUDENT') return 'HỌC VIÊN';
  return role ? peerRoleLabel(role).toUpperCase() : '';
}

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
    user?: {
      fullName?: string;
      id?: string;
      role?: string;
      avatar?: string;
      bio?: string;
      teacherVerificationStatus?: string;
    };
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
  const isVerifiedTeacher =
    peerRole === 'TEACHER' && data?.user?.teacherVerificationStatus === 'VERIFIED';
  const canInteract =
    isAuthenticated && me?.id && userId && me.id !== userId && !q.isLoading && !!data?.user;
  const showFollowBlock = canInteract;
  const isSelf = !!(me?.id && userId && me.id === userId);

  const openChat = () => {
    if (!userId) return;
    floatingChat?.openWithPeer(userId, showName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          'gap-0 overflow-hidden rounded-[28px] border-border/70 p-0 shadow-xl sm:max-w-[360px]',
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Hồ sơ {showName}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center px-6 pb-1 pt-8 text-center">
          {q.isLoading ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-muted ring-4 ring-amber-500/90 ring-offset-2 ring-offset-background">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Đang tải hồ sơ…</p>
            </div>
          ) : q.isError || !data?.user ? (
            <div className="py-8 text-sm text-destructive">
              {q.isError ? 'Không tải được hồ sơ.' : 'Không có dữ liệu người dùng.'}
            </div>
          ) : (
            <>
              <div className="relative">
                <div
                  className={cn(
                    'flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full',
                    'ring-[5px] ring-amber-500 ring-offset-[3px] ring-offset-background',
                  )}
                >
                  {data.user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={data.user.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-primary/10 text-3xl font-bold text-primary">
                      {showName.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                {isVerifiedTeacher ? (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-background bg-amber-500 shadow-sm"
                    title="Giáo viên đã xác minh"
                  >
                    <Check className="h-4 w-4 stroke-[3] text-white" aria-hidden />
                  </span>
                ) : null}
              </div>

              <h2 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
                {showName}
              </h2>
              {peerRole ? (
                <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  {roleHeadline(peerRole)}
                </p>
              ) : null}
              <p className="mt-3 text-sm text-muted-foreground">
                Uy tín: {data.community?.reputation ?? 0}
                <span className="mx-1.5 opacity-50">•</span>
                Huy hiệu: {formatCommunityBadges(data.community?.badges)}
              </p>
              {data.user.bio?.trim() ? (
                <p className="mt-4 max-h-28 w-full overflow-y-auto text-left text-sm leading-relaxed text-foreground/85">
                  {data.user.bio.trim()}
                </p>
              ) : null}

              <div className="mt-8 w-full space-y-3">
                {showFollowBlock ? (
                  <Button
                    type="button"
                    size="lg"
                    variant={data.following ? 'outline' : 'default'}
                    className={cn(
                      'h-12 w-full rounded-xl text-base font-semibold shadow-md transition-all',
                      !data.following &&
                        'border-0 bg-gradient-to-b from-primary to-primary/85 text-primary-foreground shadow-primary/25 hover:from-primary/95 hover:to-primary/75',
                    )}
                    onClick={toggleFollow}
                  >
                    {data.following ? (
                      <>Đang theo dõi</>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-5 w-5" />
                        Theo dõi
                      </>
                    )}
                  </Button>
                ) : null}

                {!isAuthenticated && userId ? (
                  <Button
                    type="button"
                    size="lg"
                    className="h-12 w-full rounded-xl border-0 bg-gradient-to-b from-primary to-primary/85 text-base font-semibold text-primary-foreground shadow-md shadow-primary/25"
                    asChild
                  >
                    <Link href={loginReturnHref} onClick={() => onOpenChange(false)}>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Đăng nhập để theo dõi
                    </Link>
                  </Button>
                ) : null}

                {fullProfileHref ? (
                  isSelf ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="h-11 w-full rounded-xl border-border/80 bg-background font-medium"
                      asChild
                    >
                      <Link href={fullProfileHref} onClick={() => onOpenChange(false)}>
                        <UserRound className="mr-2 h-4 w-4 shrink-0" />
                        Hồ sơ
                      </Link>
                    </Button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="h-11 rounded-xl border-border/80 bg-background font-medium"
                        asChild
                      >
                        <Link href={fullProfileHref} onClick={() => onOpenChange(false)}>
                          <UserRound className="mr-2 h-4 w-4 shrink-0" />
                          Hồ sơ
                        </Link>
                      </Button>
                      {dmHref ? (
                        floatingChat ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="h-11 rounded-xl border-border/80 bg-background font-medium"
                            onClick={openChat}
                          >
                            <MessageCircle className="mr-2 h-4 w-4 shrink-0" />
                            Trò chuyện
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="h-11 rounded-xl border-border/80 bg-background font-medium"
                            asChild
                          >
                            <Link href={dmHref} onClick={() => onOpenChange(false)}>
                              <MessageCircle className="mr-2 h-4 w-4 shrink-0" />
                              Trò chuyện
                            </Link>
                          </Button>
                        )
                      ) : isAuthenticated ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className="h-11 rounded-xl border-border/80 bg-background font-medium text-muted-foreground"
                          disabled
                          title="Không thể nhắn tin với tài khoản này"
                        >
                          <MessageCircle className="mr-2 h-4 w-4 shrink-0" />
                          Trò chuyện
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className="h-11 rounded-xl border-border/80 bg-background font-medium"
                          asChild
                        >
                          <Link href={loginReturnHref} onClick={() => onOpenChange(false)}>
                            <MessageCircle className="mr-2 h-4 w-4 shrink-0" />
                            Trò chuyện
                          </Link>
                        </Button>
                      )}
                    </div>
                  )
                ) : null}
              </div>
            </>
          )}
        </div>

        <div className="border-t border-border/60 px-6 py-3.5">
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.35em] text-muted-foreground/80">
            EArena · Cộng đồng học tập
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
