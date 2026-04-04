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
import {
  Loader2,
  MessageCircle,
  ExternalLink,
  UserPlus,
  User,
  BadgeCheck,
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
  /** Card giảng viên (trang khóa học) — layout theo mockup mentor */
  variant?: 'default' | 'mentor';
};

function roleBadgeMentor(role?: string): string {
  if (role === 'TEACHER') return 'GIÁO VIÊN';
  if (role === 'STUDENT') return 'HỌC VIÊN';
  if (role === 'ADMIN') return 'QUẢN TRỊ';
  return role ? peerRoleLabel(role) : 'THÀNH VIÊN';
}

export function CommunityUserProfileDialog({
  open,
  onOpenChange,
  userId,
  displayNameHint,
  variant = 'default',
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
  const isTeacherVerified = data?.user?.teacherVerificationStatus === 'VERIFIED';

  const showMentorFollow =
    isAuthenticated && me?.id && userId && me.id !== userId && !q.isLoading && data?.user;

  if (variant === 'mentor') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            'max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-[28px] border-border/80 bg-card p-0 shadow-2xl sm:max-w-[400px]',
          )}
        >
          <DialogTitle className="sr-only">Hồ sơ {showName}</DialogTitle>
          <DialogDescription className="sr-only">
            Thông tin giảng viên, uy tín cộng đồng và liên hệ
          </DialogDescription>

          {q.isLoading ? (
            <div className="px-6 pt-12 pb-8 text-center">
              <div
                className="mx-auto h-[7.5rem] w-[7.5rem] animate-pulse rounded-full bg-muted ring-4 ring-amber-500/40 ring-offset-2 ring-offset-background"
                aria-hidden
              />
              <p className="mt-6 text-xl font-bold text-foreground">{showName}</p>
              <div className="mt-4 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            </div>
          ) : q.isError || !data?.user ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-destructive">
                Không tải được hồ sơ. Vui lòng thử lại sau.
              </p>
            </div>
          ) : (
            <>
              <div className="px-6 pt-12 pb-2 text-center">
                <div className="relative mx-auto h-[7.5rem] w-[7.5rem] shrink-0">
                  {data.user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={data.user.avatar}
                      alt=""
                      className="h-full w-full rounded-full object-cover ring-4 ring-amber-500 ring-offset-2 ring-offset-background"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary ring-4 ring-amber-500 ring-offset-2 ring-offset-background">
                      {showName.charAt(0) || '?'}
                    </div>
                  )}
                  {isTeacherVerified && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-background bg-amber-500 text-white shadow-md"
                      title="Giảng viên"
                    >
                      <BadgeCheck className="h-5 w-5" strokeWidth={2.5} />
                    </span>
                  )}
                </div>
                <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
                  {showName}
                </h2>
                <p className="mt-1.5 text-sm font-semibold uppercase tracking-[0.2em] text-[#E11D48]">
                  {roleBadgeMentor(peerRole)}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Uy tín: {data.community?.reputation ?? 0} · Huy hiệu:{' '}
                  {formatCommunityBadges(data.community?.badges)}
                </p>
                {data.user.bio?.trim() ? (
                  <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
                    {data.user.bio.trim()}
                  </p>
                ) : null}
              </div>

              <div className="space-y-3 px-6 pb-2 pt-4">
                {showMentorFollow ? (
                  <Button
                    type="button"
                    className={cn(
                      'h-12 w-full rounded-xl text-base font-semibold shadow-lg transition-colors',
                      data.following
                        ? 'border-2 border-rose-200 bg-background text-rose-700 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30'
                        : 'bg-[#E11D48] text-white shadow-rose-600/25 hover:bg-[#BE123C]',
                    )}
                    onClick={toggleFollow}
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    {data.following ? 'Đang theo dõi' : 'Theo dõi'}
                  </Button>
                ) : !isAuthenticated && userId ? (
                  <Button
                    type="button"
                    className="h-12 w-full rounded-xl bg-[#E11D48] text-base font-semibold text-white shadow-lg shadow-rose-600/25 hover:bg-[#BE123C]"
                    asChild
                  >
                    <Link href={loginReturnHref} onClick={() => onOpenChange(false)}>
                      Đăng nhập để theo dõi
                    </Link>
                  </Button>
                ) : null}

                <div className="grid grid-cols-2 gap-3">
                  {fullProfileHref ? (
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-11 rounded-xl border-border/80 bg-background font-medium"
                      asChild
                    >
                      <Link href={fullProfileHref} onClick={() => onOpenChange(false)}>
                        <User className="mr-2 h-4 w-4" />
                        Hồ sơ
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="lg" className="h-11 rounded-xl" disabled>
                      <User className="mr-2 h-4 w-4" />
                      Hồ sơ
                    </Button>
                  )}
                  {dmHref && userId ? (
                    floatingChat ? (
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-11 rounded-xl border-border/80 bg-background font-medium"
                        type="button"
                        onClick={() => {
                          floatingChat.openWithPeer(userId, showName);
                          onOpenChange(false);
                        }}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Trò chuyện
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-11 rounded-xl border-border/80 bg-background font-medium"
                        asChild
                      >
                        <Link href={dmHref} onClick={() => onOpenChange(false)}>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Trò chuyện
                        </Link>
                      </Button>
                    )
                  ) : (
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-11 rounded-xl border-border/80 bg-background font-medium"
                      asChild={!isAuthenticated && !!userId}
                      disabled={isAuthenticated}
                      type="button"
                    >
                      {!isAuthenticated && userId ? (
                        <Link href={loginReturnHref} onClick={() => onOpenChange(false)}>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Trò chuyện
                        </Link>
                      ) : (
                        <>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Trò chuyện
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <div className="border-t border-border/60 px-6 py-4">
                <p className="text-center text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground/80">
                  THE RADIANT MENTOR ECOSYSTEM
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 pr-8">
            {data?.user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.user.avatar}
                alt=""
                className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                {showName.charAt(0) || '?'}
              </span>
            )}
            <span className="text-left leading-tight">{showName}</span>
          </DialogTitle>
          <DialogDescription className="space-y-1 pt-1 text-left">
            {q.isLoading ? (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
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
                {data.user.bio?.trim() ? (
                  <p className="mt-2 border-t border-border/60 pt-2 text-sm leading-relaxed text-foreground/90">
                    {data.user.bio.trim()}
                  </p>
                ) : null}
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
            <p className="w-full text-sm text-muted-foreground">
              <Link href={loginReturnHref} className="font-medium text-primary hover:underline">
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
