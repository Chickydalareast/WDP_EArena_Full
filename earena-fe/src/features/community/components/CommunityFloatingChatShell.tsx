'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { ROUTES } from '@/config/routes';
import {
  openThread,
  listMessages,
  sendMessage,
  listShareableCourses,
  listThreads,
  type ChatMessageItem,
  type ThreadListItem,
} from '@/features/messaging/api/messaging-api';
import { MessageBubble } from '@/features/messaging/components/MessageBubble';
import { messagingQueryKeys as qk } from '@/features/messaging/lib/messaging-query-keys';
import { messagingUnreadQueryKey } from '@/features/messaging/hooks/useMessagingUnreadCount';
import { peerRoleLabel } from '@/features/messaging/lib/direct-message-policy';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { useMediaUpload } from '@/shared/hooks/useMediaUpload';
import { Loader2, Send, ImagePlus, ChevronDown, X, MessageCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';

type FloatingCtx = {
  openWithPeer: (
    peerUserId: string,
    peerDisplayName?: string,
    options?: { expanded?: boolean },
  ) => void;
};

const CommunityFloatingChatContext = createContext<FloatingCtx | null>(null);
const FLOATING_CHAT_STORAGE_KEY = 'earena:floating-chat';

export function useCommunityFloatingChatOptional(): FloatingCtx | null {
  return useContext(CommunityFloatingChatContext);
}

export function CommunityFloatingChatShell({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const qc = useQueryClient();

  const [peerUserId, setPeerUserId] = useState<string | null>(null);
  const [peerDisplayName, setPeerDisplayName] = useState<string | undefined>();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [draft, setDraft] = useState('');
  const [shareCourseId, setShareCourseId] = useState('');
  const [shareCourseLabel, setShareCourseLabel] = useState('');
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false);
  const [shareFilter, setShareFilter] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const { uploadMedia, isUploading } = useMediaUpload();

  const sessionActive = !!peerUserId && !!threadId;

  useEffect(() => {
    if (typeof window === 'undefined' || !isAuthenticated) return;
    try {
      const raw = window.localStorage.getItem(FLOATING_CHAT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        peerUserId?: string;
        peerDisplayName?: string;
        expanded?: boolean;
      };
      if (!parsed?.peerUserId) return;
      setPeerUserId((prev) => prev || parsed.peerUserId || null);
      setPeerDisplayName((prev) => prev || parsed.peerDisplayName);
      setExpanded(parsed.expanded ?? true);
    } catch {
      // ignore bad localStorage
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isAuthenticated) return;
    if (!peerUserId) {
      window.localStorage.removeItem(FLOATING_CHAT_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(
      FLOATING_CHAT_STORAGE_KEY,
      JSON.stringify({
        peerUserId,
        peerDisplayName,
        expanded,
      }),
    );
  }, [expanded, isAuthenticated, peerDisplayName, peerUserId]);

  const threadsQ = useQuery({
    queryKey: qk.threads,
    queryFn: listThreads,
    enabled: isAuthenticated && sessionActive,
    staleTime: 30_000,
  });

  const openPeerMut = useMutation({
    mutationFn: (pid: string) => openThread(pid),
    onSuccess: (data) => {
      setThreadId(data.id);
      qc.invalidateQueries({ queryKey: qk.threads });
      qc.invalidateQueries({ queryKey: messagingUnreadQueryKey });
    },
    onError: () => {
      toast.error('Không mở được hội thoại');
      setPeerUserId(null);
      setPeerDisplayName(undefined);
    },
  });

  useEffect(() => {
    if (!isAuthenticated || !peerUserId || threadId || openPeerMut.isPending) return;
    openPeerMut.mutate(peerUserId);
  }, [isAuthenticated, openPeerMut.isPending, peerUserId, threadId]);

  const messagesQ = useQuery({
    queryKey: threadId ? qk.messages(threadId) : ['messaging', 'messages', 'none'],
    queryFn: () => listMessages(threadId!, 1),
    enabled: !!threadId,
    refetchInterval: 120_000,
  });

  const shareableQ = useQuery({
    queryKey: ['messaging', 'shareable-courses'] as const,
    queryFn: listShareableCourses,
    enabled: !!threadId,
    staleTime: 60_000,
  });

  const filteredShareable = useMemo(() => {
    const items = shareableQ.data?.items ?? [];
    const q = shareFilter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => c.title.toLowerCase().includes(q));
  }, [shareableQ.data, shareFilter]);

  const messages = messagesQ.data?.items ?? [];
  const lastMessage = messages[messages.length - 1] ?? null;
  const collapsedPreview = lastMessage?.body?.trim() || (lastMessage?.imageUrls?.length ? 'Đã gửi một ảnh' : lastMessage?.shareCourse ? `Đã chia sẻ: ${lastMessage.shareCourse.title}` : 'Tiếp tục cuộc trò chuyện');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, threadId]);

  const activeThread = useMemo(() => {
    const threads = threadsQ.data ?? [];
    return threads.find((t: ThreadListItem) => t.id === threadId) ?? null;
  }, [threadsQ.data, threadId]);

  const headerName =
    activeThread?.peer.fullName || peerDisplayName || 'Đang tải…';

  const sendMut = useMutation({
    mutationFn: () => {
      const body = draft.trim();
      const share = shareCourseId.trim();
      return sendMessage(threadId!, {
        ...(body ? { body } : {}),
        ...(share ? { shareCourseId: share } : {}),
      });
    },
    onSuccess: () => {
      setDraft('');
      setShareCourseId('');
      setShareCourseLabel('');
      qc.invalidateQueries({ queryKey: qk.messages(threadId!) });
      qc.invalidateQueries({ queryKey: qk.threads });
      qc.invalidateQueries({ queryKey: messagingUnreadQueryKey });
    },
    onError: () => toast.error('Gửi không thành công'),
  });

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f || !threadId) return;
    try {
      const { url } = await uploadMedia(f, 'general');
      await sendMessage(threadId, { imageUrls: [url] });
      qc.invalidateQueries({ queryKey: qk.messages(threadId) });
      qc.invalidateQueries({ queryKey: qk.threads });
      qc.invalidateQueries({ queryKey: messagingUnreadQueryKey });
    } catch {
      /* toast in hook */
    }
  };

  const openWithPeer = useCallback(
    (pid: string, name?: string, options?: { expanded?: boolean }) => {
      if (!isAuthenticated) {
        toast.error('Vui lòng đăng nhập để nhắn tin');
        return;
      }
      setPeerUserId(pid);
      setPeerDisplayName(name);
      setThreadId(null);
      setExpanded(options?.expanded ?? true);
      setDraft('');
      setShareCourseId('');
      setShareCourseLabel('');
      openPeerMut.mutate(pid);
    },
    [isAuthenticated, openPeerMut],
  );

  const closeSession = useCallback(() => {
    setPeerUserId(null);
    setPeerDisplayName(undefined);
    setThreadId(null);
    setExpanded(true);
    setDraft('');
    setShareCourseId('');
    setShareCourseLabel('');
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(FLOATING_CHAT_STORAGE_KEY);
    }
  }, []);

  const inboxBase =
    user?.role === 'TEACHER' ? ROUTES.TEACHER.MESSAGES : ROUTES.STUDENT.MESSAGES;
  const inboxHref =
    peerUserId && inboxBase
      ? `${inboxBase}?peer=${encodeURIComponent(peerUserId)}`
      : inboxBase;

  const ctx = useMemo(() => ({ openWithPeer }), [openWithPeer]);

  const showDock = isAuthenticated && (sessionActive || openPeerMut.isPending) && !!peerUserId;

  return (
    <CommunityFloatingChatContext.Provider value={ctx}>
      {children}

      {showDock ? (
        <div
          className="fixed z-[100] flex flex-col items-end gap-2 pointer-events-none [&>*]:pointer-events-auto"
          style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))', right: 'max(1rem, env(safe-area-inset-right))' }}
        >
          {!expanded ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-label="Mở khung chat"
              className="group relative flex w-[min(100vw-2rem,290px)] items-center gap-3 overflow-hidden rounded-[28px] border border-border/70 bg-background/95 px-3 py-3 text-left shadow-2xl backdrop-blur"
            >
              <div className="relative shrink-0">
                {activeThread?.peer.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeThread.peer.avatar}
                    alt={headerName}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-primary/15"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow">
                    {headerName.charAt(0) || 'C'}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-foreground">{headerName}</div>
                <div className="truncate text-xs text-muted-foreground">{collapsedPreview}</div>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-105">
                <MessageCircle className="h-4 w-4" />
              </div>
            </button>
          ) : (
            <Card
              className={cn(
                'flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden border-border/80 shadow-2xl',
                'h-[min(72vh,520px)]',
              )}
            >
              <div className="flex items-center gap-2 border-b bg-card px-3 py-2.5 shrink-0">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{headerName}</div>
                  {activeThread?.peer.role ? (
                    <div className="truncate text-[10px] text-muted-foreground">
                      {peerRoleLabel(activeThread.peer.role)}
                    </div>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => setExpanded(false)}
                  aria-label="Thu nhỏ"
                  title="Thu nhỏ thành bong bóng chat"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {inboxHref ? (
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
                    <Link href={inboxHref} aria-label="Mở hộp thư đầy đủ">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={closeSession}
                  aria-label="Đóng"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col bg-muted/15">
                <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-2">
                  {openPeerMut.isPending || !threadId ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                    </div>
                  ) : messagesQ.isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    messages.map((m: ChatMessageItem) => (
                      <MessageBubble
                        key={m.id}
                        m={m}
                        isMine={m.senderId === user?.id}
                        peerName={headerName}
                        peerAvatar={activeThread?.peer.avatar}
                      />
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>

                {threadId ? (
                  <div className="shrink-0 space-y-2 border-t bg-card p-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Popover open={sharePopoverOpen} onOpenChange={setSharePopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" size="sm" className="h-7 text-[11px] px-2">
                            Chia sẻ khóa
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-2" align="start">
                          <Input
                            placeholder="Tìm khóa học..."
                            value={shareFilter}
                            onChange={(e) => setShareFilter(e.target.value)}
                            className="mb-2 h-8 text-xs"
                          />
                          <div className="max-h-44 space-y-1 overflow-y-auto">
                            {shareableQ.isLoading ? (
                              <Loader2 className="mx-auto my-2 h-5 w-5 animate-spin text-muted-foreground" />
                            ) : null}
                            {filteredShareable.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                className="flex w-full gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
                                onClick={() => {
                                  setShareCourseId(c.id);
                                  setShareCourseLabel(c.title);
                                  setSharePopoverOpen(false);
                                  setShareFilter('');
                                }}
                              >
                                <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded bg-muted">
                                  {c.coverUrl ? (
                                    <Image
                                      src={c.coverUrl}
                                      alt=""
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  ) : null}
                                </span>
                                <span className="line-clamp-2 min-w-0 flex-1">{c.title}</span>
                              </button>
                            ))}
                            {!shareableQ.isLoading && filteredShareable.length === 0 ? (
                              <p className="p-2 text-[11px] text-muted-foreground">Không có khóa để chia sẻ.</p>
                            ) : null}
                          </div>
                        </PopoverContent>
                      </Popover>
                      {shareCourseId ? (
                        <span className="max-w-[200px] truncate rounded-full bg-primary/10 px-2 py-0.5 text-[10px]">
                          {shareCourseLabel || shareCourseId}
                          <button
                            type="button"
                            className="ml-1 text-primary underline"
                            onClick={() => {
                              setShareCourseId('');
                              setShareCourseLabel('');
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ) : null}
                    </div>
                    <div className="flex gap-1.5 items-end">
                      <label className="shrink-0 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={onPickImage}
                          disabled={isUploading}
                        />
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-muted">
                          {isUploading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ImagePlus className="h-3.5 w-3.5" />
                          )}
                        </span>
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
                        className="h-9 flex-1 text-sm"
                      />
                      <Button
                        type="button"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        disabled={sendMut.isPending || (!draft.trim() && !shareCourseId.trim())}
                        onClick={() => sendMut.mutate()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </Card>
          )}
        </div>
      ) : null}
    </CommunityFloatingChatContext.Provider>
  );
}
