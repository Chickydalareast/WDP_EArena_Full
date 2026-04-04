'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import {
  listThreads,
  openThread,
  listMessages,
  sendMessage,
  listShareableCourses,
  type ThreadListItem,
  type ChatMessageItem,
} from '../api/messaging-api';
import { messagingUnreadQueryKey } from '../hooks/useMessagingUnreadCount';
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
import { Loader2, Send, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';

const qk = {
  threads: ['messaging', 'threads'] as const,
  messages: (id: string) => ['messaging', 'messages', id] as const,
};

export function MessagesScreen({ basePath }: { basePath: '/student/messages' | '/teacher/messages' }) {
  const searchParams = useSearchParams();
  const peerFromUrl = searchParams.get('peer');
  const qc = useQueryClient();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [shareCourseId, setShareCourseId] = useState('');
  const [shareCourseLabel, setShareCourseLabel] = useState('');
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false);
  const [shareFilter, setShareFilter] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastOpenedPeerRef = useRef<string | null>(null);
  const { uploadMedia, isUploading } = useMediaUpload();

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
    onError: () => toast.error('Không mở được hội thoại'),
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

  const messagesQ = useQuery({
    queryKey: activeThreadId ? qk.messages(activeThreadId) : ['messaging', 'messages', 'none'],
    queryFn: () => listMessages(activeThreadId!, 1),
    enabled: !!activeThreadId,
    refetchInterval: 15_000,
  });

  const shareableQ = useQuery({
    queryKey: ['messaging', 'shareable-courses'] as const,
    queryFn: listShareableCourses,
    enabled: !!activeThreadId,
    staleTime: 60_000,
  });

  const filteredShareable = useMemo(() => {
    const items = shareableQ.data?.items ?? [];
    const q = shareFilter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => c.title.toLowerCase().includes(q));
  }, [shareableQ.data, shareFilter]);

  const messageCount = messagesQ.data?.items?.length ?? 0;

  useEffect(() => {
    if (!activeThreadId || !messagesQ.isSuccess) return;
    qc.invalidateQueries({ queryKey: messagingUnreadQueryKey });
    qc.invalidateQueries({ queryKey: qk.threads });
  }, [activeThreadId, messagesQ.isSuccess, messageCount, qc]);

  const sendMut = useMutation({
    mutationFn: () => {
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
      /* toast in hook */
    }
  };

  const threads = threadsQ.data ?? [];
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
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-4 h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tin nhắn</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href={mePrefix.DASHBOARD}>Về trang chủ</Link>
        </Button>
      </div>
      <div className="flex flex-1 gap-4 min-h-0">
        <Card className="w-full max-w-xs shrink-0 overflow-y-auto p-2 space-y-1">
          {threadsQ.isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin m-4" />
          ) : threads.length === 0 ? (
            <p className="text-sm text-muted-foreground p-3">Chưa có hội thoại.</p>
          ) : (
            threads.map((t: ThreadListItem) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveThreadId(t.id)}
                className={cn(
                  'w-full text-left rounded-lg px-3 py-2 text-sm transition',
                  activeThreadId === t.id ? 'bg-primary/15 font-medium' : 'hover:bg-muted',
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{t.peer.fullName}</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {t.peer.role === 'TEACHER' ? 'Giáo viên' : 'Học viên'}
                    </div>
                  </div>
                  {t.unread ? (
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                      aria-label="Chưa đọc"
                    />
                  ) : null}
                </div>
              </button>
            ))
          )}
        </Card>
        <Card className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {!activeThreadId ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-6">
              Chọn một cuộc trò chuyện hoặc mở từ trang khóa học (Nhắn giáo viên).
            </div>
          ) : (
            <>
              <div className="border-b px-4 py-3 font-semibold shrink-0">
                {activeThread?.peer.fullName || 'Đang tải…'}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
                {messagesQ.isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  messages.map((m: ChatMessageItem) => (
                    <MessageBubble key={m.id} m={m} />
                  ))
                )}
                <div ref={bottomRef} />
              </div>
              <div className="border-t p-3 space-y-2 shrink-0 bg-card">
                <div className="flex flex-wrap items-center gap-2">
                  <Popover open={sharePopoverOpen} onOpenChange={setSharePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" size="sm" className="text-xs h-8">
                        Chọn khóa học
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-2" align="start">
                      <Input
                        placeholder="Tìm theo tên..."
                        value={shareFilter}
                        onChange={(e) => setShareFilter(e.target.value)}
                        className="mb-2 h-8 text-xs"
                      />
                      <div className="max-h-52 overflow-y-auto space-y-1">
                        {shareableQ.isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin m-2 text-muted-foreground" />
                        ) : null}
                        {filteredShareable.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="flex w-full gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                            onClick={() => {
                              setShareCourseId(c.id);
                              setShareCourseLabel(c.title);
                              setSharePopoverOpen(false);
                              setShareFilter('');
                            }}
                          >
                            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
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
                          <p className="p-2 text-xs text-muted-foreground">
                            Không có khóa học để chia sẻ (GV: khóa đã xuất bản; HV: khóa đang học).
                          </p>
                        ) : null}
                      </div>
                    </PopoverContent>
                  </Popover>
                  {shareCourseId ? (
                    <div className="flex min-w-0 max-w-full items-center gap-2 text-xs">
                      <span className="truncate rounded-full bg-primary/10 px-2 py-1">
                        Gửi kèm: {shareCourseLabel || shareCourseId}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 shrink-0 px-2"
                        onClick={() => {
                          setShareCourseId('');
                          setShareCourseLabel('');
                        }}
                      >
                        Bỏ
                      </Button>
                    </div>
                  ) : null}
                </div>
                <div className="flex gap-2 items-end">
                  <label className="shrink-0 cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={onPickImage} disabled={isUploading} />
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-muted">
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
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
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="icon"
                    disabled={sendMut.isPending || (!draft.trim() && !shareCourseId.trim())}
                    onClick={() => sendMut.mutate()}
                  >
                    <Send className="w-4 h-4" />
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

function MessageBubble({ m }: { m: ChatMessageItem }) {
  return (
    <div className="rounded-lg border bg-card p-3 text-sm space-y-2 max-w-[95%]">
      {m.body ? <p className="whitespace-pre-wrap">{m.body}</p> : null}
      {m.imageUrls?.length ? (
        <div className="flex flex-wrap gap-2">
          {m.imageUrls.map((u) => (
            <a key={u} href={u} target="_blank" rel="noreferrer" className="relative block w-32 h-32 rounded-md overflow-hidden border">
              <Image src={u} alt="" fill className="object-cover" unoptimized />
            </a>
          ))}
        </div>
      ) : null}
      {m.shareCourse ? (
        <Link
          href={ROUTES.PUBLIC.COURSE_DETAIL(m.shareCourse.slug)}
          className="flex gap-3 rounded-md border border-primary/30 bg-primary/5 p-2 hover:bg-primary/10"
        >
          <div className="relative w-16 h-16 shrink-0 rounded bg-muted overflow-hidden">
            {m.shareCourse.coverUrl ? (
              <Image src={m.shareCourse.coverUrl} alt="" fill className="object-cover" unoptimized />
            ) : null}
          </div>
          <div>
            <div className="font-medium line-clamp-2">{m.shareCourse.title}</div>
            <span className="text-xs text-primary">Mở khóa học →</span>
          </div>
        </Link>
      ) : null}
      <div className="text-[10px] text-muted-foreground">
        {new Date(m.createdAt).toLocaleString('vi-VN')}
      </div>
    </div>
  );
}
