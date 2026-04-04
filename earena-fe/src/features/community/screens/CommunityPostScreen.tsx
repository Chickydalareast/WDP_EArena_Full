'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { ROUTES } from '@/config/routes';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Textarea } from '@/shared/components/ui/textarea';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import {
  getCommunityPost,
  getCommunityPostComments,
  createCommunityComment,
  reactCommunityComment,
  setBestAnswer,
  updateCommunityPost,
  deleteCommunityPost,
  reportCommunity,
  type CommunityReactionKind
} from '../api/community-api';
import { PostBodyDisplay } from '../components/PostBodyDisplay';
import { PostAttachmentsDisplay } from '../components/PostAttachmentsDisplay';
import type { CommunityAttachment } from '../components/PostAttachmentsDisplay';
import { CommunityAttachmentPicker } from '../components/CommunityAttachmentPicker';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Reply } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/utils';
import { parseApiError } from '@/shared/lib/error-parser';

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

type CommentRow = {
  id: string;
  body: string;
  attachments?: unknown;
  parentCommentId?: string | null;
  author?: Record<string, unknown> | null;
  myReaction?: string | null;
  createdAt?: string;
};

function compareRootComments(
  a: CommentRow,
  b: CommentRow,
  bestId: string | null | undefined,
  pinnedId: string | null | undefined,
) {
  const rank = (id: string) => {
    if (bestId && id === bestId) return 0;
    if (pinnedId && id === pinnedId) return 1;
    return 2;
  };
  const ra = rank(a.id);
  const rb = rank(b.id);
  if (ra !== rb) return ra - rb;
  const ta = new Date(a.createdAt || 0).getTime();
  const tb = new Date(b.createdAt || 0).getTime();
  return ta - tb;
}

export function CommunityPostScreen({ postId }: { postId: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [body, setBody] = useState('');
  const [commentAttachments, setCommentAttachments] = useState<CommunityAttachment[]>([]);
  const [parentCommentId, setParentCommentId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [commentReport, setCommentReport] = useState<{ id: string } | null>(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostBody, setEditPostBody] = useState('');

  const postQ = useQuery({
    queryKey: ['community-post', postId],
    queryFn: () => getCommunityPost(postId),
  });

  const commentsQ = useQuery({
    queryKey: ['community-comments', postId],
    queryFn: () => getCommunityPostComments(postId),
  });

  const post = postQ.data as Record<string, unknown> | undefined;
  useEffect(() => {
    setEditPostBody(String(post?.bodyJson || ''));
  }, [post?.bodyJson, postId]);

  const pack = commentsQ.data as {
    comments?: CommentRow[];
    bestAnswerCommentId?: string | null;
    pinnedCommentId?: string | null;
  } | undefined;
  const rawComments = pack?.comments || [];
  const bestId = pack?.bestAnswerCommentId;
  const pinnedId = pack?.pinnedCommentId;

  useEffect(() => {
    if (typeof window === 'undefined' || !commentsQ.isSuccess) return;
    const m = /^#comment-(.+)$/.exec(window.location.hash);
    if (!m?.[1]) return;
    const el = document.getElementById(`comment-${m[1]}`);
    if (!el) return;
    const raf = window.requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-primary/50', 'rounded-lg', 'transition-shadow');
    });
    const clear = window.setTimeout(() => {
      el.classList.remove('ring-2', 'ring-primary/50', 'rounded-lg', 'transition-shadow');
    }, 2800);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(clear);
    };
  }, [commentsQ.isSuccess, rawComments.length, postId]);

  const byParent = useMemo(() => {
    const byParentMap = new Map<string | 'root', CommentRow[]>();
    for (const c of rawComments) {
      const p =
        c.parentCommentId && String(c.parentCommentId) !== 'null'
          ? String(c.parentCommentId)
          : 'root';
      const key = p === 'root' ? 'root' : p;
      if (!byParentMap.has(key)) byParentMap.set(key, []);
      byParentMap.get(key)!.push(c);
    }
    const roots = byParentMap.get('root') || [];
    roots.sort((a, b) => compareRootComments(a, b, bestId, pinnedId));
    for (const [k, list] of byParentMap) {
      if (k === 'root') continue;
      list.sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
      );
    }
    return byParentMap;
  }, [rawComments, bestId, pinnedId]);

  const refetchAll = () => {
    qc.invalidateQueries({ queryKey: ['community-post', postId] });
    qc.invalidateQueries({ queryKey: ['community-comments', postId] });
  };

  const sendComment = async () => {
    if (!isAuthenticated) {
      router.push(
        ROUTES.AUTH.LOGIN +
          '?callbackUrl=' +
          encodeURIComponent(ROUTES.PUBLIC.COMMUNITY_POST(postId)),
      );
      return;
    }
    if (!body.trim() && commentAttachments.length === 0) {
      toast.error('Nhập nội dung hoặc thêm ít nhất một ảnh.');
      return;
    }
    try {
      await createCommunityComment(postId, {
        ...(body.trim() ? { body: body.trim() } : {}),
        ...(commentAttachments.length ? { attachments: commentAttachments } : {}),
        ...(parentCommentId ? { parentCommentId } : {}),
      });
      setBody('');
      setCommentAttachments([]);
      setParentCommentId(null);
      refetchAll();
    } catch {
      toast.error('Không gửi được bình luận');
    }
  };

  const onReportPost = async () => {
    if (!reportReason.trim()) return;
    try {
      await reportCommunity({
        targetType: 'POST',
        targetId: postId,
        reason: reportReason,
      });
      toast.success('Đã gửi báo cáo');
      setReportOpen(false);
      setReportReason('');
    } catch {
      toast.error('Gửi báo cáo thất bại');
    }
  };

  const onReportComment = async () => {
    if (!commentReport || !reportReason.trim()) return;
    try {
      await reportCommunity({
        targetType: 'COMMENT',
        targetId: commentReport.id,
        postId,
        reason: reportReason,
      });
      toast.success('Đã gửi báo cáo');
      setCommentReport(null);
      setReportReason('');
    } catch {
      toast.error('Gửi báo cáo thất bại');
    }
  };

  const onUpdatePost = async () => {
    if (!hasMeaningfulRichText(editPostBody)) {
      toast.error('Nội dung bài viết không được để trống');
      return;
    }
    try {
      await updateCommunityPost(postId, {
        bodyJson: editPostBody,
      });
      toast.success('Đã cập nhật bài viết');
      setIsEditingPost(false);
      refetchAll();
    } catch (error) {
      toast.error(parseApiError(error).message || 'Không thể cập nhật bài viết');
    }
  };

  const onDeletePost = async () => {
    if (!window.confirm('Bạn chắc chắn muốn xóa bài viết này?')) return;
    try {
      await deleteCommunityPost(postId);
      toast.success('Đã xóa bài viết');
      router.push(ROUTES.PUBLIC.COMMUNITY);
    } catch {
      toast.error('Không thể xóa bài viết');
    }
  };

  if (postQ.isLoading || !post) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const snap = post.courseSnapshot as Record<string, unknown> | undefined;
  const author = post.author as Record<string, unknown> | null;
  const subject = post.subject as { id: string; name: string } | null | undefined;
  const commentsLocked = !!post.commentsLocked;
  const canManagePost = !!user?.id && String(post.authorId || author?.id || '') === user.id;

  const renderCommentNode = (c: CommentRow, depth: number): ReactNode => {
    const cid = String(c.id);
    const ca = c.author;
    const isBest = bestId === cid;
    const children = byParent.get(cid) || [];

    return (
      <div
        key={cid}
        id={`comment-${cid}`}
        className={depth > 0 ? 'mt-3 ml-4 pl-4 border-l border-border/70 scroll-mt-24' : 'scroll-mt-24'}
      >
        <Card
          className={`p-4 space-y-2 ${isBest ? 'border-primary ring-1 ring-primary/30' : ''}`}
        >
          {isBest && (
            <span className="text-xs font-bold text-primary">Câu trả lời hay nhất</span>
          )}
          {ca?.id ? (
            <Link
              href={ROUTES.PUBLIC.COMMUNITY_PROFILE(String(ca.id))}
              className="inline-block text-sm font-medium hover:text-primary hover:underline transition-colors"
            >
              {ca?.fullName as string}
            </Link>
          ) : (
            <div className="text-sm font-medium">{ca?.fullName as string}</div>
          )}
          {!(
            c.body === '[Đính kèm ảnh]' &&
            Array.isArray(c.attachments) &&
            (c.attachments as { kind?: string }[]).some((a) => a.kind === 'IMAGE')
          ) && (
            <p className="text-sm whitespace-pre-wrap">{c.body}</p>
          )}
          <PostAttachmentsDisplay attachments={c.attachments} className="pt-1" />
          <div className="flex flex-wrap gap-1">
            {REACTIONS.map((r) => (
              <Button
                key={r.kind}
                size="sm"
                variant={(c.myReaction as string | undefined) === r.kind ? 'default' : 'outline'}
                className="h-7 text-xs"
                onClick={async () => {
                  if (!isAuthenticated) {
                    router.push(ROUTES.AUTH.LOGIN);
                    return;
                  }
                  try {
                    await reactCommunityComment(cid, r.kind);
                    refetchAll();
                  } catch {
                    toast.error('Lỗi react');
                  }
                }}
              >
                {r.label}
              </Button>
            ))}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => {
                if (!isAuthenticated) {
                  router.push(
                    ROUTES.AUTH.LOGIN +
                      '?callbackUrl=' +
                      encodeURIComponent(ROUTES.PUBLIC.COMMUNITY_POST(postId)),
                  );
                  return;
                }
                setParentCommentId(cid);
                setBody('');
                setCommentAttachments([]);
              }}
            >
              <Reply className="w-3 h-3 mr-1" />
              Trả lời
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => {
                setCommentReport({ id: cid });
                setReportReason('');
              }}
            >
              Báo cáo
            </Button>
            {user?.id &&
              (String((post as { authorId?: string }).authorId) === user.id ||
                user.role === 'TEACHER' ||
                user.role === 'ADMIN') && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs"
                  onClick={async () => {
                    try {
                      await setBestAnswer(postId, cid);
                      refetchAll();
                    } catch {
                      toast.error('Không đánh dấu được');
                    }
                  }}
                >
                  Chọn hay nhất
                </Button>
              )}
          </div>
        </Card>
        {children.map((ch) => renderCommentNode(ch, depth + 1))}
      </div>
    );
  };

  const rootComments = byParent.get('root') || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={ROUTES.PUBLIC.COMMUNITY}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Về feed
        </Link>
      </Button>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
            {(author?.fullName as string)?.charAt(0) || '?'}
          </div>
          <div>
            <div className="font-semibold">{author?.fullName as string}</div>
            <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
              <span>{String(post.type)}</span>
              {subject && (
                <Link
                  href={ROUTES.PUBLIC.COMMUNITY_SUBJECT(subject.id)}
                  className="text-primary hover:underline"
                >
                  {subject.name}
                </Link>
              )}
            </div>
          </div>
        </div>
        {isEditingPost ? (
          <div className="space-y-3 rounded-xl border border-primary/20 bg-muted/20 p-3">
            <RichTextEditor value={editPostBody} onChange={setEditPostBody} placeholder="Chỉnh sửa bài viết..." />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setIsEditingPost(false); setEditPostBody(String(post.bodyJson || '')); }}>
                Hủy
              </Button>
              <Button size="sm" onClick={onUpdatePost}>
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
            className="block rounded-xl border p-3 bg-muted/30 hover:bg-muted/50"
          >
            <div className="font-bold">{String(snap.title)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatCurrency(
                Number(snap.discountPrice) > 0
                  ? Number(snap.discountPrice)
                  : Number(snap.price),
              )}
            </div>
          </Link>
        )}
        <div className="flex flex-wrap gap-2">
          {canManagePost && (
            <>
              <Button variant="secondary" size="sm" onClick={() => { setIsEditingPost((v) => !v); setEditPostBody(String(post.bodyJson || '')); }}>
                {isEditingPost ? 'Đóng chỉnh sửa' : 'Sửa bài viết'}
              </Button>
              <Button variant="outline" size="sm" className="text-destructive" onClick={onDeletePost}>
                Xóa bài viết
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={() => setReportOpen((v) => !v)}>
            Báo cáo bài viết
          </Button>
        </div>
        {reportOpen && (
          <div className="space-y-2 border rounded-lg p-3">
            <Textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Lý do báo cáo..."
            />
            <Button size="sm" onClick={onReportPost}>
              Gửi
            </Button>
          </div>
        )}
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Bình luận</h2>
        {commentsLocked && (
          <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2">
            Bài viết đã khóa bình luận.
          </p>
        )}
        {!commentsLocked && (
          <>
            {parentCommentId && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Đang trả lời một bình luận</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setParentCommentId(null);
                    setCommentAttachments([]);
                  }}
                >
                  Hủy
                </Button>
              </div>
            )}
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={parentCommentId ? 'Viết phản hồi...' : 'Viết bình luận...'}
              rows={3}
            />
            <CommunityAttachmentPicker
              attachments={commentAttachments}
              onChange={setCommentAttachments}
            />
            <Button onClick={sendComment}>Gửi</Button>
          </>
        )}

        <div className="space-y-3 pt-4">
          {rootComments.map((c) => renderCommentNode(c, 0))}
        </div>
      </section>

      {commentReport && (
        <Card className="p-4 space-y-3 border-destructive/30">
          <p className="text-sm font-medium">Báo cáo bình luận</p>
          <Textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Lý do..."
          />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setCommentReport(null)}>
              Hủy
            </Button>
            <Button size="sm" onClick={onReportComment}>
              Gửi báo cáo
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
