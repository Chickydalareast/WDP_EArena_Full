'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityPostScreen = CommunityPostScreen;
const react_1 = require("react");
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const react_query_1 = require("@tanstack/react-query");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const routes_1 = require("@/config/routes");
const button_1 = require("@/shared/components/ui/button");
const card_1 = require("@/shared/components/ui/card");
const textarea_1 = require("@/shared/components/ui/textarea");
const community_api_1 = require("../api/community-api");
const PostBodyDisplay_1 = require("../components/PostBodyDisplay");
const PostAttachmentsDisplay_1 = require("../components/PostAttachmentsDisplay");
const CommunityAttachmentPicker_1 = require("../components/CommunityAttachmentPicker");
const CommunityUserProfileDialog_1 = require("../components/CommunityUserProfileDialog");
const sonner_1 = require("sonner");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
const REACTIONS = [
    { kind: 'HELPFUL', label: 'Hữu ích' },
    { kind: 'LOVE', label: 'Hay' },
    { kind: 'QUALITY', label: 'Chất lượng' },
    { kind: 'SPOT_ON', label: 'Đúng ý' },
    { kind: 'THANKS', label: 'Cảm ơn' },
];
function compareRootComments(a, b, bestId, pinnedId) {
    const rank = (id) => {
        if (bestId && id === bestId)
            return 0;
        if (pinnedId && id === pinnedId)
            return 1;
        return 2;
    };
    const ra = rank(a.id);
    const rb = rank(b.id);
    if (ra !== rb)
        return ra - rb;
    const ta = new Date(a.createdAt || 0).getTime();
    const tb = new Date(b.createdAt || 0).getTime();
    return ta - tb;
}
function CommunityPostScreen({ postId }) {
    const router = (0, navigation_1.useRouter)();
    const qc = (0, react_query_1.useQueryClient)();
    const user = (0, auth_store_1.useAuthStore)((s) => s.user);
    const isAuthenticated = (0, auth_store_1.useAuthStore)((s) => s.isAuthenticated);
    const [body, setBody] = (0, react_1.useState)('');
    const [commentAttachments, setCommentAttachments] = (0, react_1.useState)([]);
    const [parentCommentId, setParentCommentId] = (0, react_1.useState)(null);
    const [reportOpen, setReportOpen] = (0, react_1.useState)(false);
    const [reportReason, setReportReason] = (0, react_1.useState)('');
    const [commentReport, setCommentReport] = (0, react_1.useState)(null);
    const [profileDlg, setProfileDlg] = (0, react_1.useState)(null);
    const postQ = (0, react_query_1.useQuery)({
        queryKey: ['community-post', postId],
        queryFn: () => (0, community_api_1.getCommunityPost)(postId),
    });
    const commentsQ = (0, react_query_1.useQuery)({
        queryKey: ['community-comments', postId],
        queryFn: () => (0, community_api_1.getCommunityPostComments)(postId),
    });
    const post = postQ.data;
    const pack = commentsQ.data;
    const rawComments = pack?.comments || [];
    const bestId = pack?.bestAnswerCommentId;
    const pinnedId = pack?.pinnedCommentId;
    (0, react_1.useEffect)(() => {
        if (typeof window === 'undefined' || !commentsQ.isSuccess)
            return;
        const m = /^#comment-(.+)$/.exec(window.location.hash);
        if (!m?.[1])
            return;
        const el = document.getElementById(`comment-${m[1]}`);
        if (!el)
            return;
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
    const byParent = (0, react_1.useMemo)(() => {
        const byParentMap = new Map();
        for (const c of rawComments) {
            const p = c.parentCommentId && String(c.parentCommentId) !== 'null'
                ? String(c.parentCommentId)
                : 'root';
            const key = p === 'root' ? 'root' : p;
            if (!byParentMap.has(key))
                byParentMap.set(key, []);
            byParentMap.get(key).push(c);
        }
        const roots = byParentMap.get('root') || [];
        roots.sort((a, b) => compareRootComments(a, b, bestId, pinnedId));
        for (const [k, list] of byParentMap) {
            if (k === 'root')
                continue;
            list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        }
        return byParentMap;
    }, [rawComments, bestId, pinnedId]);
    const refetchAll = () => {
        qc.invalidateQueries({ queryKey: ['community-post', postId] });
        qc.invalidateQueries({ queryKey: ['community-comments', postId] });
    };
    const sendComment = async () => {
        if (!isAuthenticated) {
            router.push(routes_1.ROUTES.AUTH.LOGIN +
                '?callbackUrl=' +
                encodeURIComponent(routes_1.ROUTES.PUBLIC.COMMUNITY_POST(postId)));
            return;
        }
        if (!body.trim() && commentAttachments.length === 0) {
            sonner_1.toast.error('Nhập nội dung hoặc thêm ít nhất một ảnh.');
            return;
        }
        try {
            await (0, community_api_1.createCommunityComment)(postId, {
                ...(body.trim() ? { body: body.trim() } : {}),
                ...(commentAttachments.length ? { attachments: commentAttachments } : {}),
                ...(parentCommentId ? { parentCommentId } : {}),
            });
            setBody('');
            setCommentAttachments([]);
            setParentCommentId(null);
            refetchAll();
        }
        catch {
            sonner_1.toast.error('Không gửi được bình luận');
        }
    };
    const onReportPost = async () => {
        if (!reportReason.trim())
            return;
        try {
            await (0, community_api_1.reportCommunity)({
                targetType: 'POST',
                targetId: postId,
                reason: reportReason,
            });
            sonner_1.toast.success('Đã gửi báo cáo');
            setReportOpen(false);
            setReportReason('');
        }
        catch {
            sonner_1.toast.error('Gửi báo cáo thất bại');
        }
    };
    const onReportComment = async () => {
        if (!commentReport || !reportReason.trim())
            return;
        try {
            await (0, community_api_1.reportCommunity)({
                targetType: 'COMMENT',
                targetId: commentReport.id,
                postId,
                reason: reportReason,
            });
            sonner_1.toast.success('Đã gửi báo cáo');
            setCommentReport(null);
            setReportReason('');
        }
        catch {
            sonner_1.toast.error('Gửi báo cáo thất bại');
        }
    };
    if (postQ.isLoading || !post) {
        return (<div className="flex justify-center py-24">
        <lucide_react_1.Loader2 className="w-8 h-8 animate-spin text-primary"/>
      </div>);
    }
    const snap = post.courseSnapshot;
    const author = post.author;
    const authorId = author?.id ||
        (post.authorId ? String(post.authorId) : '');
    const openAuthorProfile = (id, name) => {
        if (id)
            setProfileDlg({ id, name });
    };
    const subject = post.subject;
    const commentsLocked = !!post.commentsLocked;
    const renderCommentNode = (c, depth) => {
        const cid = String(c.id);
        const ca = c.author;
        const commentAuthorId = ca?.id ? String(ca.id) : '';
        const isBest = bestId === cid;
        const children = byParent.get(cid) || [];
        return (<div key={cid} id={`comment-${cid}`} className={depth > 0 ? 'mt-3 ml-4 pl-4 border-l border-border/70 scroll-mt-24' : 'scroll-mt-24'}>
        <card_1.Card className={`p-4 space-y-2 ${isBest ? 'border-primary ring-1 ring-primary/30' : ''}`}>
          {isBest && (<span className="text-xs font-bold text-primary">Câu trả lời hay nhất</span>)}
          <div className="text-sm font-medium">
            {commentAuthorId ? (<button type="button" className="hover:underline text-foreground text-left" onClick={() => openAuthorProfile(commentAuthorId, ca?.fullName || undefined)}>
                {ca?.fullName || 'Thành viên'}
              </button>) : ((ca?.fullName || 'Thành viên'))}
          </div>
          {!(c.body === '[Đính kèm ảnh]' &&
                Array.isArray(c.attachments) &&
                c.attachments.some((a) => a.kind === 'IMAGE')) && (<p className="text-sm whitespace-pre-wrap">{c.body}</p>)}
          <PostAttachmentsDisplay_1.PostAttachmentsDisplay attachments={c.attachments} className="pt-1"/>
          <div className="flex flex-wrap gap-1">
            {REACTIONS.map((r) => (<button_1.Button key={r.kind} size="sm" variant={c.myReaction === r.kind ? 'default' : 'outline'} className="h-7 text-xs" onClick={async () => {
                    if (!isAuthenticated) {
                        router.push(routes_1.ROUTES.AUTH.LOGIN);
                        return;
                    }
                    try {
                        await (0, community_api_1.reactCommunityComment)(cid, r.kind);
                        refetchAll();
                    }
                    catch {
                        sonner_1.toast.error('Lỗi react');
                    }
                }}>
                {r.label}
              </button_1.Button>))}
            <button_1.Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => {
                if (!isAuthenticated) {
                    router.push(routes_1.ROUTES.AUTH.LOGIN +
                        '?callbackUrl=' +
                        encodeURIComponent(routes_1.ROUTES.PUBLIC.COMMUNITY_POST(postId)));
                    return;
                }
                setParentCommentId(cid);
                setBody('');
                setCommentAttachments([]);
            }}>
              <lucide_react_1.Reply className="w-3 h-3 mr-1"/>
              Trả lời
            </button_1.Button>
            <button_1.Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => {
                setCommentReport({ id: cid });
                setReportReason('');
            }}>
              Báo cáo
            </button_1.Button>
            {user?.id &&
                (String(post.authorId) === user.id ||
                    user.role === 'TEACHER' ||
                    user.role === 'ADMIN') && (<button_1.Button size="sm" variant="secondary" className="h-7 text-xs" onClick={async () => {
                    try {
                        await (0, community_api_1.setBestAnswer)(postId, cid);
                        refetchAll();
                    }
                    catch {
                        sonner_1.toast.error('Không đánh dấu được');
                    }
                }}>
                  Chọn hay nhất
                </button_1.Button>)}
          </div>
        </card_1.Card>
        {children.map((ch) => renderCommentNode(ch, depth + 1))}
      </div>);
    };
    const rootComments = byParent.get('root') || [];
    return (<div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <button_1.Button variant="ghost" size="sm" asChild>
        <link_1.default href={routes_1.ROUTES.PUBLIC.COMMUNITY}>
          <lucide_react_1.ArrowLeft className="w-4 h-4 mr-2"/>
          Về feed
        </link_1.default>
      </button_1.Button>

      <card_1.Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          {authorId ? (<button type="button" className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-primary/40" aria-label="Xem hồ sơ" onClick={() => openAuthorProfile(authorId, author?.fullName || undefined)}>
              {author?.fullName?.charAt(0) || '?'}
            </button>) : (<div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
              {author?.fullName?.charAt(0) || '?'}
            </div>)}
          <div>
            <div className="font-semibold">
              {authorId ? (<button type="button" className="hover:underline text-foreground text-left" onClick={() => openAuthorProfile(authorId, author?.fullName || undefined)}>
                  {author?.fullName || 'Ẩn danh'}
                </button>) : ((author?.fullName || 'Ẩn danh'))}
            </div>
            <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
              <span>{String(post.type)}</span>
              {subject && (<link_1.default href={routes_1.ROUTES.PUBLIC.COMMUNITY_SUBJECT(subject.id)} className="text-primary hover:underline">
                  {subject.name}
                </link_1.default>)}
            </div>
          </div>
        </div>
        <PostBodyDisplay_1.PostBodyDisplay bodyJson={String(post.bodyJson || '')}/>
        <PostAttachmentsDisplay_1.PostAttachmentsDisplay attachments={post.attachments} className="pt-1"/>
        {snap && (<link_1.default href={routes_1.ROUTES.PUBLIC.COURSE_DETAIL(String(snap.slug))} className="block rounded-xl border p-3 bg-muted/30 hover:bg-muted/50">
            <div className="font-bold">{String(snap.title)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {(0, utils_1.formatCurrency)(Number(snap.discountPrice) > 0
                ? Number(snap.discountPrice)
                : Number(snap.price))}
            </div>
          </link_1.default>)}
        <div className="flex flex-wrap gap-2">
          <button_1.Button variant="outline" size="sm" onClick={() => setReportOpen((v) => !v)}>
            Báo cáo bài viết
          </button_1.Button>
        </div>
        {reportOpen && (<div className="space-y-2 border rounded-lg p-3">
            <textarea_1.Textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Lý do báo cáo..."/>
            <button_1.Button size="sm" onClick={onReportPost}>
              Gửi
            </button_1.Button>
          </div>)}
      </card_1.Card>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Bình luận</h2>
        {commentsLocked && (<p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2">
            Bài viết đã khóa bình luận.
          </p>)}
        {!commentsLocked && (<>
            {parentCommentId && (<div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Đang trả lời một bình luận</span>
                <button_1.Button variant="ghost" size="sm" onClick={() => {
                    setParentCommentId(null);
                    setCommentAttachments([]);
                }}>
                  Hủy
                </button_1.Button>
              </div>)}
            <textarea_1.Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={parentCommentId ? 'Viết phản hồi...' : 'Viết bình luận...'} rows={3}/>
            <CommunityAttachmentPicker_1.CommunityAttachmentPicker attachments={commentAttachments} onChange={setCommentAttachments} maxImages={4}/>
            <button_1.Button onClick={sendComment}>Gửi</button_1.Button>
          </>)}

        <div className="space-y-3 pt-4">
          {rootComments.map((c) => renderCommentNode(c, 0))}
        </div>
      </section>

      <CommunityUserProfileDialog_1.CommunityUserProfileDialog open={!!profileDlg} onOpenChange={(o) => !o && setProfileDlg(null)} userId={profileDlg?.id ?? null} displayNameHint={profileDlg?.name}/>

      {commentReport && (<card_1.Card className="p-4 space-y-3 border-destructive/30">
          <p className="text-sm font-medium">Báo cáo bình luận</p>
          <textarea_1.Textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Lý do..."/>
          <div className="flex gap-2">
            <button_1.Button size="sm" variant="outline" onClick={() => setCommentReport(null)}>
              Hủy
            </button_1.Button>
            <button_1.Button size="sm" onClick={onReportComment}>
              Gửi báo cáo
            </button_1.Button>
          </div>
        </card_1.Card>)}
    </div>);
}
//# sourceMappingURL=CommunityPostScreen.js.map