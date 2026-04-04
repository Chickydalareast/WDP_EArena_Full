'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { ROUTES } from '@/config/routes';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import {
  getCommunityFeed,
  getCommunitySidebar,
  createCommunityPost,
  updateCommunityPost,
  deleteCommunityPost,
  saveCommunityPost,
  unsaveCommunityPost,
  reactCommunityPost,
  unreactCommunityPost,
  getTaxonomySubjects,
  getCommunityFollowing,
  followCommunity,
  unfollowCommunity,
  type CommunityFeedSort,
  type CommunityPostType,
  type CommunityReactionKind,
} from '../api/community-api';
import { PostBodyDisplay } from '../components/PostBodyDisplay';
import { PostAttachmentsDisplay } from '../components/PostAttachmentsDisplay';
import type { CommunityAttachment } from '../components/PostAttachmentsDisplay';
import { toast } from 'sonner';
import { Loader2, Bookmark, MessageCircle, Sparkles, Bell, BellOff } from 'lucide-react';
import { cn, formatCurrency } from '@/shared/lib/utils';
import { parseApiError } from '@/shared/lib/error-parser';

const TYPE_LABELS: Record<string, string> = {
  HOMEWORK_QUESTION: 'Hỏi bài',
  RESOURCE_SHARE: 'Tài liệu',
  EXPERIENCE_SHARE: 'Kinh nghiệm',
  COURSE_REVIEW: 'Review khóa',
  EXAM_DISCUSSION: 'Thảo luận đề',
  COURSE_SHARE: 'Chia sẻ khóa học',
};

const REACTIONS: { kind: CommunityReactionKind; label: string }[] = [
  { kind: 'HELPFUL', label: 'Hữu ích' },
  { kind: 'LOVE', label: 'Hay' },
  { kind: 'QUALITY', label: 'Chất lượng' },
  { kind: 'SPOT_ON', label: 'Đúng ý' },
  { kind: 'THANKS', label: 'Cảm ơn' },
];


function hasMeaningfulRichText(value: string) {
  const plain = value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > 0;
}

export function CommunityFeedScreen(props?: { lockedSubjectId?: string }) {
  const { lockedSubjectId } = props || {};
  const router = useRouter();
  const qc = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [sort, setSort] = useState<CommunityFeedSort>('NEW');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [composerSubjectId, setComposerSubjectId] = useState<string>('');
  const [cursor, setCursor] = useState<string | undefined>();
  const [composerOpen, setComposerOpen] = useState(false);
  const [body, setBody] = useState('');
  const [composerAttachments, setComposerAttachments] = useState<CommunityAttachment[]>([]);
  const [postType, setPostType] = useState<CommunityPostType>('HOMEWORK_QUESTION');

  const feedSubjectId =
    lockedSubjectId ?? (subjectFilter === 'ALL' ? undefined : subjectFilter);

  const subjectsQuery = useQuery({
    queryKey: ['taxonomy-subjects'],
    queryFn: () => getTaxonomySubjects(),
  });

  const followingQuery = useQuery({
    queryKey: ['community-following'],
    queryFn: () => getCommunityFollowing(),
    enabled: isAuthenticated && !!lockedSubjectId,
  });

  const subjects = subjectsQuery.data ?? [];
  const lockedSubjectName = useMemo(() => {
    if (!lockedSubjectId) return '';
    return subjects.find((s) => s._id === lockedSubjectId)?.name || 'Môn học';
  }, [lockedSubjectId, subjects]);

  const followingSubject = useMemo(() => {
    if (!lockedSubjectId || !followingQuery.data) return false;
    return followingQuery.data.some(
      (f) => f.targetType === 'SUBJECT' && String(f.targetId) === lockedSubjectId,
    );
  }, [lockedSubjectId, followingQuery.data]);

  const toggleFollowSubject = async () => {
    if (!lockedSubjectId) return;
    try {
      if (followingSubject) {
        await unfollowCommunity('SUBJECT', lockedSubjectId);
        toast.success('Đã bỏ theo dõi môn');
      } else {
        await followCommunity('SUBJECT', lockedSubjectId);
        toast.success('Đã theo dõi môn — bài mới sẽ gợi ý tốt hơn');
      }
      qc.invalidateQueries({ queryKey: ['community-following'] });
    } catch {
      toast.error('Không thực hiện được');
    }
  };

  const feedQuery = useQuery({
    queryKey: ['community-feed', sort, typeFilter, feedSubjectId, cursor],
    queryFn: () =>
      getCommunityFeed({
        sort,
        type:
          typeFilter === 'ALL'
            ? undefined
            : (typeFilter as CommunityPostType),
        subjectId: feedSubjectId,
        cursor,
        limit: 15,
      }),
  });

  const sidebarQuery = useQuery({
    queryKey: ['community-sidebar'],
    queryFn: () => getCommunitySidebar(),
  });

  const [accumulated, setAccumulated] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    setCursor(undefined);
    setAccumulated([]);
  }, [sort, typeFilter, feedSubjectId]);

  useEffect(() => {
    if (!feedQuery.data) return;
    const d = feedQuery.data as { items?: Record<string, unknown>[] };
    const chunk = d.items || [];
    if (!cursor) setAccumulated(chunk);
    else setAccumulated((prev) => [...prev, ...chunk]);
  }, [feedQuery.data, cursor]);

  const items = accumulated;

  const nextCursor = (feedQuery.data as { nextCursor?: string | null })?.nextCursor;

  const onCreate = async () => {
    if (!isAuthenticated) {
      const path = lockedSubjectId
        ? ROUTES.PUBLIC.COMMUNITY_SUBJECT(lockedSubjectId)
        : ROUTES.PUBLIC.COMMUNITY;
      router.push(ROUTES.AUTH.LOGIN + '?callbackUrl=' + encodeURIComponent(path));
      return;
    }
    const hasText = hasMeaningfulRichText(body);
    if (!hasText && composerAttachments.length === 0) {
      toast.error('Nhập nội dung hoặc thêm ít nhất một ảnh.');
      return;
    }
    const sid = lockedSubjectId || composerSubjectId || undefined;
    try {
      await createCommunityPost({
        type: postType,
        bodyJson: hasText ? body : '<p></p>',
        ...(composerAttachments.length
          ? { attachments: composerAttachments }
          : {}),
        ...(sid ? { subjectId: sid } : {}),
      });
      toast.success('Đã đăng bài');
      setBody('');
      setComposerAttachments([]);
      setComposerOpen(false);
      setCursor(undefined);
      await Promise.all([feedQuery.refetch(), sidebarQuery.refetch()]);
    } catch (error) {
      toast.error(parseApiError(error).message || 'Không thể đăng bài');
    }
  };

  const subjectsDirectory = (
    sidebarQuery.data as {
      subjectsDirectory?: {
        subjectId: string;
        name: string;
        postCount: number;
        code?: string;
      }[];
    }
  )?.subjectsDirectory;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <aside className="lg:col-span-3 space-y-4 order-2 lg:order-1">
        <Card className="p-4 space-y-3">
          <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
            Lọc nội dung
          </p>
          <Select value={sort} onValueChange={(v) => { setSort(v as CommunityFeedSort); setCursor(undefined); }}>
            <SelectTrigger>
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEW">Mới nhất</SelectItem>
              <SelectItem value="HOT">Đang hot</SelectItem>
              {isAuthenticated && (
                <>
                  <SelectItem value="FOLLOWING">Người theo dõi</SelectItem>
                  <SelectItem value="FOR_YOU">Gợi ý cho bạn</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          <Select
            value={typeFilter}
            onValueChange={(v) => { setTypeFilter(v); setCursor(undefined); }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Loại bài" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!lockedSubjectId && (
            <Select
              value={subjectFilter}
              onValueChange={(v) => { setSubjectFilter(v); setCursor(undefined); }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Môn học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả môn</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={String(s._id)} value={String(s._id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Card>

        {!lockedSubjectId && subjectsDirectory && subjectsDirectory.length > 0 && (
          <Card className="p-4">
            <p className="text-xs font-bold uppercase text-muted-foreground mb-3">
              Theo môn học
            </p>
            <div className="space-y-2 text-sm">
              {subjectsDirectory.map((s) => (
                <Link
                  key={s.subjectId}
                  href={ROUTES.PUBLIC.COMMUNITY_SUBJECT(s.subjectId)}
                  className="flex justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted/80"
                >
                  <span className="truncate text-primary font-medium">{s.name}</span>
                  <span className="text-muted-foreground shrink-0">{s.postCount}</span>
                </Link>
              ))}
            </div>
            <Button variant="link" className="px-0 h-auto mt-2 text-xs" asChild>
              <Link href={ROUTES.PUBLIC.COMMUNITY}>Toàn bộ cộng đồng</Link>
            </Button>
          </Card>
        )}

        <Card className="p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground mb-3">
            Bài nổi bật
          </p>
          <div className="space-y-3 text-sm">
            {(sidebarQuery.data as { featuredPosts?: { id: string; bodyPlain?: string }[] })?.featuredPosts?.map((p) => (
              <Link
                key={p.id}
                href={ROUTES.PUBLIC.COMMUNITY_POST(p.id)}
                className="block line-clamp-2 text-primary hover:underline"
              >
                {p.bodyPlain}
              </Link>
            )) || <span className="text-muted-foreground">Chưa có bài ghim.</span>}
          </div>
        </Card>
      </aside>

      <section className="lg:col-span-6 space-y-4 order-1 lg:order-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {lockedSubjectId ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">{lockedSubjectName}</h1>
                  {isAuthenticated && (
                    <Button
                      size="sm"
                      variant={followingSubject ? 'outline' : 'secondary'}
                      onClick={toggleFollowSubject}
                      disabled={followingQuery.isLoading}
                    >
                      {followingSubject ? (
                        <>
                          <BellOff className="w-4 h-4 mr-1" /> Bỏ theo dõi môn
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4 mr-1" /> Theo dõi môn
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Thảo luận theo môn ·{' '}
                  <Link href={ROUTES.PUBLIC.COMMUNITY} className="text-primary hover:underline">
                    Về feed chung
                  </Link>
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold tracking-tight">Cộng đồng học tập</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Hỏi bài, chia sẻ kinh nghiệm, review khóa học — tất cả tại đây.
                </p>
              </>
            )}
          </div>
          <Button
            onClick={() => {
              if (!isAuthenticated) {
                const path = lockedSubjectId
                  ? ROUTES.PUBLIC.COMMUNITY_SUBJECT(lockedSubjectId)
                  : ROUTES.PUBLIC.COMMUNITY;
                router.push(ROUTES.AUTH.LOGIN + '?callbackUrl=' + encodeURIComponent(path));
                return;
              }
              setComposerOpen((v) => !v);
            }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Đăng bài
          </Button>
        </div>

        {composerOpen && (
          <Card className="p-4 space-y-3 border-primary/30">
            <Select
              value={postType}
              onValueChange={(v) => setPostType(v as CommunityPostType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!lockedSubjectId && (
              <Select
                value={composerSubjectId || '_none'}
                onValueChange={(v) => setComposerSubjectId(v === '_none' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gắn môn (khuyến nghị)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Không chọn môn</SelectItem>
                  {subjects.map((s) => (
                    <SelectItem key={String(s._id)} value={String(s._id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {lockedSubjectId && (
              <p className="text-xs text-muted-foreground">
                Bài đăng sẽ thuộc môn: <span className="font-medium text-foreground">{lockedSubjectName}</span>
              </p>
            )}
            <RichTextEditor value={body} onChange={setBody} placeholder="Viết nội dung..." />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setComposerOpen(false)}>
                Hủy
              </Button>
              <Button type="button" onClick={onCreate}>
                Đăng
              </Button>
            </div>
          </Card>
        )}

        {feedQuery.isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((post: Record<string, unknown>) => (
              <PostCard key={String(post.id)} post={post} onFeedChange={() => feedQuery.refetch()} />
            ))}
            {!items.length && (
              <Card className="p-10 text-center text-muted-foreground">
                Chưa có bài viết. Hãy là người đầu tiên!
              </Card>
            )}
            {nextCursor && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setCursor(nextCursor)}
              >
                Xem thêm
              </Button>
            )}
          </div>
        )}
      </section>

      <aside className="lg:col-span-3 space-y-4 order-3">
        <Card className="p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground mb-3">
            Top đóng góp
          </p>
          <div className="space-y-3 text-sm">
            {(sidebarQuery.data as { topContributors?: { userId: string; reputation: number; user?: { fullName?: string } }[] })?.topContributors?.map((c) => (
              <div key={c.userId} className="flex justify-between gap-2">
                <Link
                  href={ROUTES.PUBLIC.COMMUNITY_PROFILE(c.userId)}
                  className="font-medium text-primary hover:underline truncate"
                >
                  {c.user?.fullName || 'Thành viên'}
                </Link>
                <span className="text-muted-foreground shrink-0">{c.reputation} điểm</span>
              </div>
            )) || null}
          </div>
        </Card>
      </aside>
    </div>
  );
}

function PostCard({
  post,
  onFeedChange,
}: {
  post: Record<string, unknown>;
  onFeedChange: () => void;
}) {
  const id = String(post.id);
  const author = post.author as Record<string, unknown> | null;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const saved = !!post.savedByMe;
  const myReaction = post.myReaction as CommunityReactionKind | null | undefined;
  const snap = post.courseSnapshot as Record<string, unknown> | undefined;
  const subject = post.subject as { id: string; name: string } | null | undefined;
  const canManagePost = !!user?.id && String(post.authorId || author?.id || '') === user.id;
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(String(post.bodyJson || ''));

  useEffect(() => {
    setEditBody(String(post.bodyJson || ''));
  }, [post.bodyJson, id]);

  const toggleSave = async () => {
    if (!isAuthenticated) {
      router.push(ROUTES.AUTH.LOGIN + '?callbackUrl=' + encodeURIComponent('/community'));
      return;
    }
    try {
      if (saved) await unsaveCommunityPost(id);
      else await saveCommunityPost(id);
      onFeedChange();
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  const onReact = async (kind: CommunityReactionKind) => {
    if (!isAuthenticated) {
      router.push(ROUTES.AUTH.LOGIN + '?callbackUrl=' + encodeURIComponent('/community'));
      return;
    }
    try {
      if (myReaction === kind) await unreactCommunityPost(id);
      else await reactCommunityPost(id, kind);
      onFeedChange();
    } catch {
      toast.error('Không thể gửi cảm xúc');
    }
  };

  const onSaveEdit = async () => {
    if (!hasMeaningfulRichText(editBody)) {
      toast.error('Nội dung bài viết không được để trống');
      return;
    }
    try {
      await updateCommunityPost(id, {
        bodyJson: editBody,
      });
      toast.success('Đã cập nhật bài viết');
      setIsEditing(false);
      onFeedChange();
    } catch (error) {
      toast.error(parseApiError(error).message || 'Không thể cập nhật bài viết');
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Bạn chắc chắn muốn xóa bài viết này?')) return;
    try {
      await deleteCommunityPost(id);
      toast.success('Đã xóa bài viết');
      onFeedChange();
    } catch {
      toast.error('Không thể xóa bài viết');
    }
  };

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl pr-3">
          <Link
            href={author?.id ? ROUTES.PUBLIC.COMMUNITY_PROFILE(String(author.id)) : '#'}
            className="flex shrink-0 rounded-xl transition hover:bg-muted/40"
            aria-label="Xem hồ sơ"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {(author?.fullName as string)?.charAt(0) || '?'}
            </div>
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              href={author?.id ? ROUTES.PUBLIC.COMMUNITY_PROFILE(String(author.id)) : '#'}
              className="inline-flex max-w-full rounded-lg transition hover:bg-muted/40"
            >
              <span className="font-semibold truncate">
                {(author?.fullName as string) || 'Ẩn danh'}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {author?.role as string}
                </span>
              </span>
            </Link>
            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>{TYPE_LABELS[String(post.type)] || String(post.type)}</span>
              {subject && (
                <Link
                  href={ROUTES.PUBLIC.COMMUNITY_SUBJECT(subject.id)}
                  className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-primary hover:bg-primary/15"
                >
                  {subject.name}
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {canManagePost && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  setIsEditing((v) => !v);
                  setEditBody(String(post.bodyJson || ''));
                }}
              >
                {isEditing ? 'Đóng' : 'Sửa'}
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive" onClick={onDelete}>
                Xóa
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={toggleSave} aria-label="Lưu bài">
            <Bookmark className={cn('w-5 h-5', saved && 'fill-primary text-primary')} />
          </Button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3 rounded-xl border border-primary/20 bg-muted/20 p-3">
          <RichTextEditor value={editBody} onChange={setEditBody} placeholder="Chỉnh sửa bài viết..." />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditBody(String(post.bodyJson || '')); }}>
              Hủy
            </Button>
            <Button size="sm" onClick={onSaveEdit}>
              Lưu chỉnh sửa
            </Button>
          </div>
        </div>
      ) : (
        <>
          <PostBodyDisplay bodyJson={String(post.bodyJson || '')} />
          <PostAttachmentsDisplay attachments={post.attachments} className="pt-1" />
        </>
      )}

      {snap && (
        <Link
          href={ROUTES.PUBLIC.COURSE_DETAIL(String(snap.slug))}
          className="block rounded-xl border border-border bg-muted/30 p-3 hover:bg-muted/50 transition"
        >
          <div className="font-bold">{String(snap.title)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            GV: {String(snap.teacherName)} ·{' '}
            {formatCurrency(
              Number(snap.discountPrice) > 0
                ? Number(snap.discountPrice)
                : Number(snap.price),
            )}
          </div>
        </Link>
      )}

      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60">
        {REACTIONS.map((r) => (
          <Button
            key={r.kind}
            size="sm"
            variant={myReaction === r.kind ? 'default' : 'outline'}
            className="h-8 text-xs"
            onClick={() => onReact(r.kind)}
          >
            {r.label}
          </Button>
        ))}
        <Button size="sm" variant="secondary" className="h-8 text-xs" asChild>
          <Link href={ROUTES.PUBLIC.COMMUNITY_POST(id)}>
            <MessageCircle className="w-3.5 h-3.5 mr-1" />
            Bình luận
          </Link>
        </Button>
      </div>
    </Card>
  );
}
