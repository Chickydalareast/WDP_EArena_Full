'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityFeedScreen = CommunityFeedScreen;
const react_1 = require("react");
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const react_query_1 = require("@tanstack/react-query");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const routes_1 = require("@/config/routes");
const button_1 = require("@/shared/components/ui/button");
const card_1 = require("@/shared/components/ui/card");
const select_1 = require("@/shared/components/ui/select");
const rich_text_editor_1 = require("@/shared/components/ui/rich-text-editor");
const community_api_1 = require("../api/community-api");
const PostBodyDisplay_1 = require("../components/PostBodyDisplay");
const PostAttachmentsDisplay_1 = require("../components/PostAttachmentsDisplay");
const CommunityAttachmentPicker_1 = require("../components/CommunityAttachmentPicker");
const CommunityUserProfileDialog_1 = require("../components/CommunityUserProfileDialog");
const sonner_1 = require("sonner");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
const TYPE_LABELS = {
    HOMEWORK_QUESTION: 'Hỏi bài',
    RESOURCE_SHARE: 'Tài liệu',
    EXPERIENCE_SHARE: 'Kinh nghiệm',
    COURSE_REVIEW: 'Review khóa',
    EXAM_DISCUSSION: 'Thảo luận đề',
    COURSE_SHARE: 'Chia sẻ khóa học',
};
const REACTIONS = [
    { kind: 'HELPFUL', label: 'Hữu ích' },
    { kind: 'LOVE', label: 'Hay' },
    { kind: 'QUALITY', label: 'Chất lượng' },
    { kind: 'SPOT_ON', label: 'Đúng ý' },
    { kind: 'THANKS', label: 'Cảm ơn' },
];
function CommunityFeedScreen(props) {
    const { lockedSubjectId } = props || {};
    const router = (0, navigation_1.useRouter)();
    const qc = (0, react_query_1.useQueryClient)();
    const isAuthenticated = (0, auth_store_1.useAuthStore)((s) => s.isAuthenticated);
    const [sort, setSort] = (0, react_1.useState)('NEW');
    const [typeFilter, setTypeFilter] = (0, react_1.useState)('ALL');
    const [subjectFilter, setSubjectFilter] = (0, react_1.useState)('ALL');
    const [composerSubjectId, setComposerSubjectId] = (0, react_1.useState)('');
    const [cursor, setCursor] = (0, react_1.useState)();
    const [composerOpen, setComposerOpen] = (0, react_1.useState)(false);
    const [profileDlg, setProfileDlg] = (0, react_1.useState)(null);
    const [body, setBody] = (0, react_1.useState)('');
    const [composerAttachments, setComposerAttachments] = (0, react_1.useState)([]);
    const [postType, setPostType] = (0, react_1.useState)('HOMEWORK_QUESTION');
    const feedSubjectId = lockedSubjectId ?? (subjectFilter === 'ALL' ? undefined : subjectFilter);
    const subjectsQuery = (0, react_query_1.useQuery)({
        queryKey: ['taxonomy-subjects'],
        queryFn: () => (0, community_api_1.getTaxonomySubjects)(),
    });
    const followingQuery = (0, react_query_1.useQuery)({
        queryKey: ['community-following'],
        queryFn: () => (0, community_api_1.getCommunityFollowing)(),
        enabled: isAuthenticated && !!lockedSubjectId,
    });
    const subjects = subjectsQuery.data ?? [];
    const lockedSubjectName = (0, react_1.useMemo)(() => {
        if (!lockedSubjectId)
            return '';
        return subjects.find((s) => s._id === lockedSubjectId)?.name || 'Môn học';
    }, [lockedSubjectId, subjects]);
    const followingSubject = (0, react_1.useMemo)(() => {
        if (!lockedSubjectId || !followingQuery.data)
            return false;
        return followingQuery.data.some((f) => f.targetType === 'SUBJECT' && String(f.targetId) === lockedSubjectId);
    }, [lockedSubjectId, followingQuery.data]);
    const toggleFollowSubject = async () => {
        if (!lockedSubjectId)
            return;
        try {
            if (followingSubject) {
                await (0, community_api_1.unfollowCommunity)('SUBJECT', lockedSubjectId);
                sonner_1.toast.success('Đã bỏ theo dõi môn');
            }
            else {
                await (0, community_api_1.followCommunity)('SUBJECT', lockedSubjectId);
                sonner_1.toast.success('Đã theo dõi môn — bài mới sẽ gợi ý tốt hơn');
            }
            qc.invalidateQueries({ queryKey: ['community-following'] });
        }
        catch {
            sonner_1.toast.error('Không thực hiện được');
        }
    };
    const feedQuery = (0, react_query_1.useQuery)({
        queryKey: ['community-feed', sort, typeFilter, feedSubjectId, cursor],
        queryFn: () => (0, community_api_1.getCommunityFeed)({
            sort,
            type: typeFilter === 'ALL'
                ? undefined
                : typeFilter,
            subjectId: feedSubjectId,
            cursor,
            limit: 15,
        }),
    });
    const sidebarQuery = (0, react_query_1.useQuery)({
        queryKey: ['community-sidebar'],
        queryFn: () => (0, community_api_1.getCommunitySidebar)(),
    });
    const [accumulated, setAccumulated] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        setCursor(undefined);
        setAccumulated([]);
    }, [sort, typeFilter, feedSubjectId]);
    (0, react_1.useEffect)(() => {
        if (!feedQuery.data)
            return;
        const d = feedQuery.data;
        const chunk = d.items || [];
        if (!cursor)
            setAccumulated(chunk);
        else
            setAccumulated((prev) => [...prev, ...chunk]);
    }, [feedQuery.data, cursor]);
    const items = accumulated;
    const nextCursor = feedQuery.data?.nextCursor;
    const onCreate = async () => {
        if (!isAuthenticated) {
            const path = lockedSubjectId
                ? routes_1.ROUTES.PUBLIC.COMMUNITY_SUBJECT(lockedSubjectId)
                : routes_1.ROUTES.PUBLIC.COMMUNITY;
            router.push(routes_1.ROUTES.AUTH.LOGIN + '?callbackUrl=' + encodeURIComponent(path));
            return;
        }
        const hasText = !!(body.trim() && body !== '<p></p>');
        if (!hasText && composerAttachments.length === 0) {
            sonner_1.toast.error('Nhập nội dung hoặc thêm ít nhất một ảnh.');
            return;
        }
        const sid = lockedSubjectId || composerSubjectId || undefined;
        try {
            await (0, community_api_1.createCommunityPost)({
                type: postType,
                bodyJson: body.trim() ? body : '<p></p>',
                ...(composerAttachments.length
                    ? { attachments: composerAttachments }
                    : {}),
                ...(sid ? { subjectId: sid } : {}),
            });
            sonner_1.toast.success('Đã đăng bài');
            setBody('');
            setComposerAttachments([]);
            setComposerOpen(false);
            setCursor(undefined);
            feedQuery.refetch();
            sidebarQuery.refetch();
        }
        catch {
            sonner_1.toast.error('Không thể đăng bài');
        }
    };
    const subjectsDirectory = sidebarQuery.data?.subjectsDirectory;
    return (<div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <aside className="lg:col-span-3 space-y-4 order-2 lg:order-1">
        <card_1.Card className="p-4 space-y-3">
          <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
            Lọc nội dung
          </p>
          <select_1.Select value={sort} onValueChange={(v) => { setSort(v); setCursor(undefined); }}>
            <select_1.SelectTrigger>
              <select_1.SelectValue placeholder="Sắp xếp"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="NEW">Mới nhất</select_1.SelectItem>
              <select_1.SelectItem value="HOT">Đang hot</select_1.SelectItem>
              {isAuthenticated && (<>
                  <select_1.SelectItem value="FOLLOWING">Người theo dõi</select_1.SelectItem>
                  <select_1.SelectItem value="FOR_YOU">Gợi ý cho bạn</select_1.SelectItem>
                </>)}
            </select_1.SelectContent>
          </select_1.Select>
          <select_1.Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCursor(undefined); }}>
            <select_1.SelectTrigger>
              <select_1.SelectValue placeholder="Loại bài"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="ALL">Tất cả loại</select_1.SelectItem>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (<select_1.SelectItem key={k} value={k}>
                  {v}
                </select_1.SelectItem>))}
            </select_1.SelectContent>
          </select_1.Select>
          {!lockedSubjectId && (<select_1.Select value={subjectFilter} onValueChange={(v) => { setSubjectFilter(v); setCursor(undefined); }}>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Môn học"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="ALL">Tất cả môn</select_1.SelectItem>
                {subjects.map((s) => (<select_1.SelectItem key={String(s._id)} value={String(s._id)}>
                    {s.name}
                  </select_1.SelectItem>))}
              </select_1.SelectContent>
            </select_1.Select>)}
        </card_1.Card>

        {!lockedSubjectId && subjectsDirectory && subjectsDirectory.length > 0 && (<card_1.Card className="p-4">
            <p className="text-xs font-bold uppercase text-muted-foreground mb-3">
              Theo môn học
            </p>
            <div className="space-y-2 text-sm">
              {subjectsDirectory.map((s) => (<link_1.default key={s.subjectId} href={routes_1.ROUTES.PUBLIC.COMMUNITY_SUBJECT(s.subjectId)} className="flex justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted/80">
                  <span className="truncate text-primary font-medium">{s.name}</span>
                  <span className="text-muted-foreground shrink-0">{s.postCount}</span>
                </link_1.default>))}
            </div>
            <button_1.Button variant="link" className="px-0 h-auto mt-2 text-xs" asChild>
              <link_1.default href={routes_1.ROUTES.PUBLIC.COMMUNITY}>Toàn bộ cộng đồng</link_1.default>
            </button_1.Button>
          </card_1.Card>)}

        <card_1.Card className="p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground mb-3">
            Bài nổi bật
          </p>
          <div className="space-y-3 text-sm">
            {sidebarQuery.data?.featuredPosts?.map((p) => (<link_1.default key={p.id} href={routes_1.ROUTES.PUBLIC.COMMUNITY_POST(p.id)} className="block line-clamp-2 text-primary hover:underline">
                {p.bodyPlain}
              </link_1.default>)) || <span className="text-muted-foreground">Chưa có bài ghim.</span>}
          </div>
        </card_1.Card>
      </aside>

      <section className="lg:col-span-6 space-y-4 order-1 lg:order-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {lockedSubjectId ? (<>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">{lockedSubjectName}</h1>
                  {isAuthenticated && (<button_1.Button size="sm" variant={followingSubject ? 'outline' : 'secondary'} onClick={toggleFollowSubject} disabled={followingQuery.isLoading}>
                      {followingSubject ? (<>
                          <lucide_react_1.BellOff className="w-4 h-4 mr-1"/> Bỏ theo dõi môn
                        </>) : (<>
                          <lucide_react_1.Bell className="w-4 h-4 mr-1"/> Theo dõi môn
                        </>)}
                    </button_1.Button>)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Thảo luận theo môn ·{' '}
                  <link_1.default href={routes_1.ROUTES.PUBLIC.COMMUNITY} className="text-primary hover:underline">
                    Về feed chung
                  </link_1.default>
                </p>
              </>) : (<>
                <h1 className="text-2xl font-bold tracking-tight">Cộng đồng học tập</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Hỏi bài, chia sẻ kinh nghiệm, review khóa học — tất cả tại đây.
                </p>
              </>)}
          </div>
          <button_1.Button onClick={() => {
            if (!isAuthenticated) {
                const path = lockedSubjectId
                    ? routes_1.ROUTES.PUBLIC.COMMUNITY_SUBJECT(lockedSubjectId)
                    : routes_1.ROUTES.PUBLIC.COMMUNITY;
                router.push(routes_1.ROUTES.AUTH.LOGIN + '?callbackUrl=' + encodeURIComponent(path));
                return;
            }
            setComposerOpen((v) => !v);
        }}>
            <lucide_react_1.Sparkles className="w-4 h-4 mr-2"/>
            Đăng bài
          </button_1.Button>
        </div>

        {composerOpen && (<card_1.Card className="p-4 space-y-3 border-primary/30">
            <select_1.Select value={postType} onValueChange={(v) => setPostType(v)}>
              <select_1.SelectTrigger>
                <select_1.SelectValue />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {Object.entries(TYPE_LABELS).map(([k, v]) => (<select_1.SelectItem key={k} value={k}>
                    {v}
                  </select_1.SelectItem>))}
              </select_1.SelectContent>
            </select_1.Select>
            {!lockedSubjectId && (<select_1.Select value={composerSubjectId || '_none'} onValueChange={(v) => setComposerSubjectId(v === '_none' ? '' : v)}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Gắn môn (khuyến nghị)"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="_none">Không chọn môn</select_1.SelectItem>
                  {subjects.map((s) => (<select_1.SelectItem key={String(s._id)} value={String(s._id)}>
                      {s.name}
                    </select_1.SelectItem>))}
                </select_1.SelectContent>
              </select_1.Select>)}
            {lockedSubjectId && (<p className="text-xs text-muted-foreground">
                Bài đăng sẽ thuộc môn: <span className="font-medium text-foreground">{lockedSubjectName}</span>
              </p>)}
            <rich_text_editor_1.RichTextEditor value={body} onChange={setBody} placeholder="Viết nội dung..."/>
            <CommunityAttachmentPicker_1.CommunityAttachmentPicker attachments={composerAttachments} onChange={setComposerAttachments}/>
            <div className="flex justify-end gap-2">
              <button_1.Button type="button" variant="ghost" onClick={() => setComposerOpen(false)}>
                Hủy
              </button_1.Button>
              <button_1.Button type="button" onClick={onCreate}>
                Đăng
              </button_1.Button>
            </div>
          </card_1.Card>)}

        {feedQuery.isLoading ? (<div className="flex justify-center py-20">
            <lucide_react_1.Loader2 className="w-8 h-8 animate-spin text-primary"/>
          </div>) : (<div className="space-y-4">
            {items.map((post) => (<PostCard key={String(post.id)} post={post} onFeedChange={() => feedQuery.refetch()} onAuthorClick={(id, name) => setProfileDlg({ id, name })}/>))}
            {!items.length && (<card_1.Card className="p-10 text-center text-muted-foreground">
                Chưa có bài viết. Hãy là người đầu tiên!
              </card_1.Card>)}
            {nextCursor && (<button_1.Button variant="outline" className="w-full" onClick={() => setCursor(nextCursor)}>
                Xem thêm
              </button_1.Button>)}
          </div>)}
      </section>

      <aside className="lg:col-span-3 space-y-4 order-3">
        <card_1.Card className="p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground mb-3">
            Top đóng góp
          </p>
          <div className="space-y-3 text-sm">
            {sidebarQuery.data?.topContributors?.map((c) => (<div key={c.userId} className="flex justify-between gap-2">
                <button type="button" className="font-medium text-primary hover:underline truncate text-left min-w-0" onClick={() => setProfileDlg({ id: c.userId, name: c.user?.fullName })}>
                  {c.user?.fullName || 'Thành viên'}
                </button>
                <span className="text-muted-foreground shrink-0">{c.reputation} điểm</span>
              </div>)) || null}
          </div>
        </card_1.Card>
      </aside>

      <CommunityUserProfileDialog_1.CommunityUserProfileDialog open={!!profileDlg} onOpenChange={(o) => !o && setProfileDlg(null)} userId={profileDlg?.id ?? null} displayNameHint={profileDlg?.name}/>
    </div>);
}
function PostCard({ post, onFeedChange, onAuthorClick, }) {
    const id = String(post.id);
    const author = post.author;
    const router = (0, navigation_1.useRouter)();
    const isAuthenticated = (0, auth_store_1.useAuthStore)((s) => s.isAuthenticated);
    const saved = !!post.savedByMe;
    const myReaction = post.myReaction;
    const snap = post.courseSnapshot;
    const subject = post.subject;
    const authorId = author?.id ||
        (post.authorId ? String(post.authorId) : '');
    const toggleSave = async () => {
        if (!isAuthenticated) {
            router.push(routes_1.ROUTES.AUTH.LOGIN + '?callbackUrl=' + encodeURIComponent('/community'));
            return;
        }
        try {
            if (saved)
                await (0, community_api_1.unsaveCommunityPost)(id);
            else
                await (0, community_api_1.saveCommunityPost)(id);
            onFeedChange();
        }
        catch {
            sonner_1.toast.error('Thao tác thất bại');
        }
    };
    const onReact = async (kind) => {
        if (!isAuthenticated) {
            router.push(routes_1.ROUTES.AUTH.LOGIN + '?callbackUrl=' + encodeURIComponent('/community'));
            return;
        }
        try {
            if (myReaction === kind)
                await (0, community_api_1.unreactCommunityPost)(id);
            else
                await (0, community_api_1.reactCommunityPost)(id, kind);
            onFeedChange();
        }
        catch {
            sonner_1.toast.error('Không thể gửi cảm xúc');
        }
    };
    return (<card_1.Card className="p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {authorId ? (<button type="button" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-primary/40" aria-label="Xem hồ sơ" onClick={() => onAuthorClick(authorId, author?.fullName || undefined)}>
              {author?.fullName?.charAt(0) || '?'}
            </button>) : (<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
              {author?.fullName?.charAt(0) || '?'}
            </div>)}
          <div className="min-w-0">
            <div className="font-semibold truncate">
              {authorId ? (<button type="button" className="hover:underline text-foreground text-left" onClick={() => onAuthorClick(authorId, author?.fullName || undefined)}>
                  {author?.fullName || 'Ẩn danh'}
                </button>) : (author?.fullName || 'Ẩn danh')}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {author?.role}
              </span>
            </div>
            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>{TYPE_LABELS[String(post.type)] || String(post.type)}</span>
              {subject && (<link_1.default href={routes_1.ROUTES.PUBLIC.COMMUNITY_SUBJECT(subject.id)} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-primary hover:bg-primary/15">
                  {subject.name}
                </link_1.default>)}
            </div>
          </div>
        </div>
        <button_1.Button variant="ghost" size="icon" onClick={toggleSave} aria-label="Lưu bài">
          <lucide_react_1.Bookmark className={(0, utils_1.cn)('w-5 h-5', saved && 'fill-primary text-primary')}/>
        </button_1.Button>
      </div>

      <PostBodyDisplay_1.PostBodyDisplay bodyJson={String(post.bodyJson || '')}/>
      <PostAttachmentsDisplay_1.PostAttachmentsDisplay attachments={post.attachments} className="pt-1"/>

      {snap && (<link_1.default href={routes_1.ROUTES.PUBLIC.COURSE_DETAIL(String(snap.slug))} className="block rounded-xl border border-border bg-muted/30 p-3 hover:bg-muted/50 transition">
          <div className="font-bold">{String(snap.title)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            GV: {String(snap.teacherName)} ·{' '}
            {(0, utils_1.formatCurrency)(Number(snap.discountPrice) > 0
                ? Number(snap.discountPrice)
                : Number(snap.price))}
          </div>
        </link_1.default>)}

      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60">
        {REACTIONS.map((r) => (<button_1.Button key={r.kind} size="sm" variant={myReaction === r.kind ? 'default' : 'outline'} className="h-8 text-xs" onClick={() => onReact(r.kind)}>
            {r.label}
          </button_1.Button>))}
        <button_1.Button size="sm" variant="secondary" className="h-8 text-xs" asChild>
          <link_1.default href={routes_1.ROUTES.PUBLIC.COMMUNITY_POST(id)}>
            <lucide_react_1.MessageCircle className="w-3.5 h-3.5 mr-1"/>
            Bình luận
          </link_1.default>
        </button_1.Button>
      </div>
    </card_1.Card>);
}
//# sourceMappingURL=CommunityFeedScreen.js.map