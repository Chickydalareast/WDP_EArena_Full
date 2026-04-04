'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import {
  listThreads,
  openThread,
  listMessages,
  sendMessage,
  listShareableCourses,
  markThreadRead,
  type ThreadListItem,
  type ChatMessageItem,
} from '../api/messaging-api';
import { messagingUnreadQueryKey } from '../hooks/useMessagingUnreadCount';
import { useMessagingRealtime } from '../hooks/useMessagingRealtime';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { ROUTES } from '@/config/routes';
import { useMediaUpload } from '@/shared/hooks/useMediaUpload';
import {
  Loader2,
  Send,
  ImagePlus,
  Search,
  ChevronLeft,
  BookOpen,
  MessagesSquare,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { useCommunityFloatingChatOptional } from '@/features/community/components/CommunityFloatingChatShell';

const qk = {
  threads: ['messaging', 'threads'] as const,
  messages: (id: string) => ['messaging', 'messages', id] as const,
};

function formatTimeLabel(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function roleLabel(role?: string) {
  if (role === 'TEACHER') return 'Giáo viên';
  if (role === 'STUDENT') return 'Học sinh';
  return 'Thành viên';
}

export function MessagesScreen({ basePath }: { basePath: '/student/messages' | '/teacher/messages' }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const peerFromUrl = searchParams.get('peer');
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [shareCourseId, setShareCourseId] = useState('');
  const [shareCourseLabel, setShareCourseLabel] = useState('');
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false);
  const [shareFilter, setShareFilter] = useState('');
  const [threadFilter, setThreadFilter] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastOpenedPeerRef = useRef<string | null>(null);
  const { uploadMedia, isUploading } = useMediaUpload();
  const floatingChat = useCommunityFloatingChatOptional();

  useMessagingRealtime(isAuthenticated);

  const threadsQ = useQuery({
    queryKey: qk.threads,
    queryFn: listThreads,
    refetchOnWindowFocus: true,
  });

  const openPeer = useMutation({
    mutationFn: (peerUserId: string) => openThread(peerUserId),
    onSuccess: (data) => {
      setActiveThreadId(data.id);
      qc.invalidateQueries({ queryKey: qk.threads });
      qc.invalidateQueries({ queryKey: messagingUnreadQueryKey });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Không mở được hội thoại';
      toast.error(message);
    },
  });

  useEffect(() => {
    if (!peerFromUrl) {
      lastOpenedPeerRef.current = null;
      return;
    }
    if (lastOpenedPeerRef.current === peerFromUrl) return;
    lastOpenedPeerRef.current = peerFromUrl;
    openPeer.mutate(peerFromUrl);
  }, [peerFromUrl]);

  useEffect(() => {
    if (!activeThreadId && threadsQ.data?.length) {
      setActiveThreadId(threadsQ.data[0].id);
    }
  }, [threadsQ.data, activeThreadId]);

  const messagesQ = useQuery({
    queryKey: activeThreadId ? qk.messages(activeThreadId) : ['messaging', 'messages', 'none'],
    queryFn: () => listMessages(activeThreadId!, 1),
    enabled: !!activeThreadId,
    refetchInterval: 120_000,
  });

  const shareableQ = useQuery({
    queryKey: ['messaging', 'shareable-courses'] as const,
    queryFn: listShareableCourses,
    enabled: !!activeThreadId,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!activeThreadId || !messagesQ.isSuccess) return;
    markThreadRead(activeThreadId).catch(() => undefined);
    qc.invalidateQueries({ queryKey: messagingUnreadQueryKey });
    qc.invalidateQueries({ queryKey: qk.threads });
  }, [activeThreadId, messagesQ.isSuccess, messagesQ.data?.items?.length, qc]);

  const filteredShareable = useMemo(() => {
    const items = shareableQ.data?.items ?? [];
    const q = shareFilter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => c.title.toLowerCase().includes(q));
  }, [shareableQ.data, shareFilter]);

  const sendMut = useMutation({
    mutationFn: async () => {
      const body = draft.trim();
      const share = shareCourseId.trim();
      return sendMessage(activeThreadId!, {
        ...(body ? { body } : {}),
        ...(share ? { shareCourseId: share } : {}),
      });
    },
    onSuccess: () => {
      setDraft('');
      setShareCourseId('');
      setShareCourseLabel('');
      qc.invalidateQueries({ queryKey: qk.messages(activeThreadId!) });
      qc.invalidateQueries({ queryKey: qk.threads });
      qc.invalidateQueries({ queryKey: messagingUnreadQueryKey });
    },
    onError: () => toast.error('Gửi không thành công'),
  });

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f || !activeThreadId) return;
    try {
      const { url } = await uploadMedia(f, 'general');
      await sendMessage(activeThreadId, { imageUrls: [url] });
      qc.invalidateQueries({ queryKey: qk.messages(activeThreadId) });
      qc.invalidateQueries({ queryKey: qk.threads });
      qc.invalidateQueries({ queryKey: messagingUnreadQueryKey });
    } catch {
      // toast handled in hook
    }
  };

  const threads = threadsQ.data ?? [];
  const filteredThreads = useMemo(() => {
    const q = threadFilter.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((thread) => {
      return [thread.peer.fullName, roleLabel(thread.peer.role)]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [threadFilter, threads]);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) ?? null,
    [threads, activeThreadId],
  );
  const messages = messagesQ.data?.items ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeThreadId]);

  const mePrefix = basePath.startsWith('/teacher') ? ROUTES.TEACHER : ROUTES.STUDENT;

  return (
    <div className="mx-auto flex h-[calc(100vh-5.5rem)] max-w-7xl flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tin nhắn riêng</h1>
          <p className="text-sm text-muted-foreground">Trao đổi nhanh với học sinh, giáo viên ngay trong nền tảng.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={mePrefix.DASHBOARD}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Về trang chủ
          </Link>
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="flex min-h-0 flex-col overflow-hidden border-border/70 shadow-sm">
          <div className="border-b px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-base font-semibold">Hộp thư</div>
                <div className="text-xs text-muted-foreground">{threads.length} cuộc trò chuyện</div>
              </div>
              <div className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                {threads.filter((t) => t.unread).length} chưa đọc
              </div>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={threadFilter}
                onChange={(e) => setThreadFilter(e.target.value)}
                placeholder="Tìm người trò chuyện..."
                className="rounded-full pl-9"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {threadsQ.isLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center text-sm text-muted-foreground">
                <MessagesSquare className="mb-3 h-8 w-8 text-primary/60" />
                Chưa có hội thoại phù hợp.
              </div>
            ) : (
              filteredThreads.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveThreadId(t.id)}
                  className={cn(
                    'mb-1 flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition',
                    activeThreadId === t.id
                      ? 'border-primary/40 bg-primary/10 shadow-sm'
                      : 'border-transparent hover:bg-muted/60',
                  )}
                >
                  <AvatarChip name={t.peer.fullName} avatar={t.peer.avatar} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate font-semibold">{t.peer.fullName}</div>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{formatTimeLabel(t.lastMessageAt)}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="truncate text-xs text-muted-foreground">{roleLabel(t.peer.role)}</span>
                      {t.unread ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        <Card className="flex min-h-0 flex-col overflow-hidden border-border/70 shadow-sm">
          {!activeThreadId || !activeThread ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-muted-foreground">
              <MessagesSquare className="mb-4 h-10 w-10 text-primary/60" />
              <div className="text-base font-semibold text-foreground">Chọn một cuộc trò chuyện</div>
              <p className="mt-1 max-w-md text-sm">Bạn có thể mở chat từ community hoặc từ hồ sơ người dùng bằng nút “Trò chuyện riêng”.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 border-b bg-gradient-to-r from-primary/10 via-background to-background px-4 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <AvatarChip name={activeThread.peer.fullName} avatar={activeThread.peer.avatar} size="lg" />
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold">{activeThread.peer.fullName}</div>
                    <div className="text-xs text-muted-foreground">{roleLabel(activeThread.peer.role)} · Trò chuyện riêng</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!activeThread) return;
                      floatingChat?.openWithPeer(activeThread.peer.id, activeThread.peer.fullName, { expanded: false });
                      router.push(ROUTES.PUBLIC.HOME);
                    }}
                    disabled={!floatingChat}
                    title="Thu nhỏ thành bong bóng chat nổi"
                  >
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Thu nhỏ
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={ROUTES.PUBLIC.COMMUNITY_PROFILE(activeThread.peer.id)}>Xem hồ sơ</Link>
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(244,245,247,0.7),rgba(255,255,255,1))] p-4 dark:bg-none dark:bg-muted/10">
                {messagesQ.isLoading ? (
                  <div className="flex items-center justify-center py-10 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Hãy bắt đầu cuộc trò chuyện đầu tiên.</div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((m) => (
                      <MessageBubble
                        key={m.id}
                        m={m}
                        isMine={m.senderId === me?.id}
                        peerName={activeThread.peer.fullName}
                        peerAvatar={activeThread.peer.avatar}
                      />
                    ))}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              <div className="border-t bg-background p-3 sm:p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Popover open={sharePopoverOpen} onOpenChange={setSharePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" size="sm" className="rounded-full text-xs">
                        <BookOpen className="mr-2 h-3.5 w-3.5" />
                        Chia sẻ khóa học
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-2" align="start">
                      <Input
                        placeholder="Tìm theo tên..."
                        value={shareFilter}
                        onChange={(e) => setShareFilter(e.target.value)}
                        className="mb-2 h-8 text-xs"
                      />
                      <div className="max-h-52 space-y-1 overflow-y-auto">
                        {shareableQ.isLoading ? (
                          <Loader2 className="m-2 h-5 w-5 animate-spin text-muted-foreground" />
                        ) : null}
                        {filteredShareable.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="flex w-full gap-2 rounded-xl px-2 py-2 text-left text-sm hover:bg-muted"
                            onClick={() => {
                              setShareCourseId(c.id);
                              setShareCourseLabel(c.title);
                              setSharePopoverOpen(false);
                              setShareFilter('');
                            }}
                          >
                            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                              {c.coverUrl ? <Image src={c.coverUrl} alt="" fill className="object-cover" unoptimized /> : null}
                            </span>
                            <span className="line-clamp-2 min-w-0 flex-1">{c.title}</span>
                          </button>
                        ))}
                        {!shareableQ.isLoading && filteredShareable.length === 0 ? (
                          <p className="p-2 text-xs text-muted-foreground">Không có khóa học phù hợp để chia sẻ.</p>
                        ) : null}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {shareCourseId ? (
                    <div className="flex min-w-0 max-w-full items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                      <span className="truncate">Gửi kèm: {shareCourseLabel || shareCourseId}</span>
                      <button
                        type="button"
                        className="rounded-full bg-background px-2 py-0.5 text-[11px] text-foreground"
                        onClick={() => {
                          setShareCourseId('');
                          setShareCourseLabel('');
                        }}
                      >
                        Bỏ
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-end gap-2 rounded-[28px] border bg-muted/40 p-2">
                  <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border bg-background hover:bg-muted">
                    <input type="file" accept="image/*" className="hidden" onChange={onPickImage} disabled={isUploading} />
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  </label>
                  <Input
                    placeholder="Nhập tin nhắn..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (draft.trim() || shareCourseId.trim()) sendMut.mutate();
                      }
                    }}
                    className="h-11 flex-1 rounded-full border-0 bg-background shadow-none focus-visible:ring-1"
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="h-11 w-11 rounded-full"
                    disabled={sendMut.isPending || (!draft.trim() && !shareCourseId.trim())}
                    onClick={() => sendMut.mutate()}
                  >
                    {sendMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function AvatarChip({ name, avatar, size = 'md' }: { name?: string; avatar?: string; size?: 'md' | 'lg' }) {
  const map = {
    md: 'h-11 w-11 text-sm',
    lg: 'h-12 w-12 text-base',
  } as const;
  return avatar ? (
    <img src={avatar} alt={name || 'avatar'} className={cn('rounded-full object-cover ring-1 ring-border', map[size])} />
  ) : (
    <div className={cn('flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ring-1 ring-primary/15', map[size])}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
}

function MessageBubble({
  m,
  isMine,
  peerName,
  peerAvatar,
}: {
  m: ChatMessageItem;
  isMine: boolean;
  peerName?: string;
  peerAvatar?: string;
}) {
  return (
    <div className={cn('flex items-end gap-2', isMine ? 'justify-end' : 'justify-start')}>
      {!isMine ? <AvatarChip name={peerName} avatar={peerAvatar} /> : null}
      <div className={cn('max-w-[78%] space-y-1', isMine && 'items-end')}>
        <div
          className={cn(
            'rounded-[22px] px-4 py-3 text-sm shadow-sm',
            isMine
              ? 'rounded-br-md bg-primary text-primary-foreground'
              : 'rounded-bl-md border bg-background text-foreground',
          )}
        >
          {m.body ? <p className="whitespace-pre-wrap">{m.body}</p> : null}
          {m.imageUrls?.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {m.imageUrls.map((u) => (
                <a key={u} href={u} target="_blank" rel="noreferrer" className="relative block h-36 w-36 overflow-hidden rounded-2xl border bg-muted">
                  <Image src={u} alt="" fill className="object-cover" unoptimized />
                </a>
              ))}
            </div>
          ) : null}
          {m.shareCourse ? (
            <Link
              href={ROUTES.PUBLIC.COURSE_DETAIL(m.shareCourse.slug)}
              className={cn(
                'mt-2 flex gap-3 rounded-2xl border p-2.5',
                isMine ? 'border-primary-foreground/20 bg-primary-foreground/10' : 'border-primary/20 bg-primary/5',
              )}
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                {m.shareCourse.coverUrl ? <Image src={m.shareCourse.coverUrl} alt="" fill className="object-cover" unoptimized /> : null}
              </div>
              <div className="min-w-0">
                <div className="line-clamp-2 font-medium">{m.shareCourse.title}</div>
                <span className={cn('text-xs', isMine ? 'text-primary-foreground/90' : 'text-primary')}>Mở khóa học →</span>
              </div>
            </Link>
          ) : null}
        </div>
        <div className={cn('px-1 text-[11px] text-muted-foreground', isMine ? 'text-right' : 'text-left')}>
          {new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {isMine ? (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          Bạn
        </div>
      ) : null}
    </div>
  );
}
