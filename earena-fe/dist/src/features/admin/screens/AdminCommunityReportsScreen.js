'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCommunityReportsScreen = AdminCommunityReportsScreen;
const react_1 = require("react");
const link_1 = __importDefault(require("next/link"));
const react_query_1 = require("@tanstack/react-query");
const community_api_1 = require("@/features/community/api/community-api");
const routes_1 = require("@/config/routes");
const button_1 = require("@/shared/components/ui/button");
const card_1 = require("@/shared/components/ui/card");
const tabs_1 = require("@/shared/components/ui/tabs");
const textarea_1 = require("@/shared/components/ui/textarea");
const input_1 = require("@/shared/components/ui/input");
const select_1 = require("@/shared/components/ui/select");
const sonner_1 = require("sonner");
const lucide_react_1 = require("lucide-react");
function AdminCommunityReportsScreen() {
    const qc = (0, react_query_1.useQueryClient)();
    const [reportStatus, setReportStatus] = (0, react_1.useState)('PENDING');
    const [resolutionNotes, setResolutionNotes] = (0, react_1.useState)({});
    const [quickPostId, setQuickPostId] = (0, react_1.useState)('');
    const [modUserId, setModUserId] = (0, react_1.useState)('');
    const [modUserStatus, setModUserStatus] = (0, react_1.useState)('MUTED');
    const [modNote, setModNote] = (0, react_1.useState)('');
    const reportsQ = (0, react_query_1.useQuery)({
        queryKey: ['admin-community-reports', reportStatus],
        queryFn: () => (0, community_api_1.getAdminCommunityReports)({
            ...(reportStatus === 'ALL' ? {} : { status: reportStatus }),
            limit: 50,
        }),
    });
    const auditQ = (0, react_query_1.useQuery)({
        queryKey: ['admin-community-audit'],
        queryFn: () => (0, community_api_1.getAdminCommunityAudit)({ page: 1, limit: 40 }),
    });
    const resolveMu = (0, react_query_1.useMutation)({
        mutationFn: ({ id, status, resolutionNote, }) => (0, community_api_1.resolveAdminCommunityReport)(id, { status, resolutionNote }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-community-reports'] });
            qc.invalidateQueries({ queryKey: ['admin-community-audit'] });
            sonner_1.toast.success('Đã cập nhật báo cáo');
        },
        onError: () => sonner_1.toast.error('Lỗi'),
    });
    const invalidateAll = () => {
        qc.invalidateQueries({ queryKey: ['admin-community-reports'] });
        qc.invalidateQueries({ queryKey: ['admin-community-audit'] });
    };
    const pack = reportsQ.data;
    const items = pack?.items || [];
    const auditPack = auditQ.data;
    const auditItems = auditPack?.items || [];
    const postIdFromReport = (r) => r.postId || r.targetPreview?.postId || (r.targetType === 'POST' ? r.targetId : undefined);
    const runQuick = async (label, fn) => {
        if (!quickPostId.trim()) {
            sonner_1.toast.error('Nhập ID bài viết');
            return;
        }
        try {
            await fn();
            sonner_1.toast.success(label);
            invalidateAll();
        }
        catch {
            sonner_1.toast.error('Thao tác thất bại');
        }
    };
    return (<tabs_1.Tabs defaultValue="reports" className="space-y-6">
      <tabs_1.TabsList>
        <tabs_1.TabsTrigger value="reports">Báo cáo</tabs_1.TabsTrigger>
        <tabs_1.TabsTrigger value="audit">Nhật ký moderation</tabs_1.TabsTrigger>
        <tabs_1.TabsTrigger value="tools">Thao tác nhanh</tabs_1.TabsTrigger>
      </tabs_1.TabsList>

      <tabs_1.TabsContent value="reports" className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">Trạng thái:</span>
          <select_1.Select value={reportStatus} onValueChange={setReportStatus}>
            <select_1.SelectTrigger className="w-[200px]">
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="PENDING">Chờ xử lý</select_1.SelectItem>
              <select_1.SelectItem value="REVIEWED">Đã xử lý</select_1.SelectItem>
              <select_1.SelectItem value="DISMISSED">Đã bỏ qua</select_1.SelectItem>
              <select_1.SelectItem value="ALL">Tất cả</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
          {reportsQ.isLoading && <lucide_react_1.Loader2 className="w-4 h-4 animate-spin"/>}
        </div>

        <div className="space-y-4">
          {items.map((r) => {
            const postId = postIdFromReport(r);
            const postHref = postId ? routes_1.ROUTES.PUBLIC.COMMUNITY_POST(postId) : null;
            const note = resolutionNotes[r.id] ?? '';
            return (<card_1.Card key={r.id} className="p-4 space-y-3">
                <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    {r.targetType} · {r.status} ·{' '}
                    {r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : ''}
                  </span>
                  <span>
                    Người báo cáo: {r.reporter?.fullName || r.reporter?.email || '—'}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground">{r.reason}</p>
                {r.targetPreview?.excerpt != null && (<blockquote className="text-sm border-l-2 pl-3 text-muted-foreground line-clamp-4">
                    {r.targetPreview.excerpt || '(Không lấy được nội dung)'}
                  </blockquote>)}
                <div className="flex flex-wrap gap-2">
                  {postHref && (<button_1.Button variant="outline" size="sm" asChild>
                      <link_1.default href={postHref} target="_blank" rel="noreferrer">
                        <lucide_react_1.ExternalLink className="w-3.5 h-3.5 mr-1"/>
                        Mở bài
                      </link_1.default>
                    </button_1.Button>)}
                  {r.status === 'PENDING' && (<>
                      <textarea_1.Textarea placeholder="Ghi chú xử lý (tuỳ chọn)" className="min-h-[60px] w-full sm:max-w-md" value={note} onChange={(e) => setResolutionNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}/>
                      <div className="flex flex-wrap gap-2 w-full">
                        <button_1.Button size="sm" variant="outline" onClick={() => resolveMu.mutate({
                        id: r.id,
                        status: 'DISMISSED',
                        resolutionNote: note || undefined,
                    })}>
                          Bỏ qua
                        </button_1.Button>
                        <button_1.Button size="sm" onClick={() => resolveMu.mutate({
                        id: r.id,
                        status: 'REVIEWED',
                        resolutionNote: note || undefined,
                    })}>
                          Đánh dấu đã xử lý
                        </button_1.Button>
                      </div>
                    </>)}
                </div>

                {postId && r.status === 'PENDING' && (<div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
                    <button_1.Button size="sm" variant="secondary" onClick={async () => {
                        try {
                            await (0, community_api_1.adminHideCommunityPost)(postId);
                            sonner_1.toast.success('Đã ẩn bài');
                            invalidateAll();
                        }
                        catch {
                            sonner_1.toast.error('Thao tác thất bại');
                        }
                    }}>
                      Ẩn bài
                    </button_1.Button>
                    <button_1.Button size="sm" variant="secondary" onClick={async () => {
                        try {
                            await (0, community_api_1.adminShowCommunityPost)(postId);
                            sonner_1.toast.success('Đã hiện bài');
                            invalidateAll();
                        }
                        catch {
                            sonner_1.toast.error('Thao tác thất bại');
                        }
                    }}>
                      Hiện bài
                    </button_1.Button>
                    <button_1.Button size="sm" variant="secondary" onClick={async () => {
                        try {
                            await (0, community_api_1.adminFeatureCommunityPost)(postId, true);
                            sonner_1.toast.success('Đã bật nổi bật');
                            invalidateAll();
                        }
                        catch {
                            sonner_1.toast.error('Thao tác thất bại');
                        }
                    }}>
                      Ghim nổi bật
                    </button_1.Button>
                    <button_1.Button size="sm" variant="secondary" onClick={async () => {
                        try {
                            await (0, community_api_1.adminFeatureCommunityPost)(postId, false);
                            sonner_1.toast.success('Đã tắt nổi bật');
                            invalidateAll();
                        }
                        catch {
                            sonner_1.toast.error('Thao tác thất bại');
                        }
                    }}>
                      Bỏ ghim
                    </button_1.Button>
                    <button_1.Button size="sm" variant="secondary" onClick={async () => {
                        try {
                            await (0, community_api_1.adminLockCommunityPostComments)(postId, true);
                            sonner_1.toast.success('Đã khóa bình luận');
                            invalidateAll();
                        }
                        catch {
                            sonner_1.toast.error('Thao tác thất bại');
                        }
                    }}>
                      Khóa bình luận
                    </button_1.Button>
                    <button_1.Button size="sm" variant="secondary" onClick={async () => {
                        try {
                            await (0, community_api_1.adminLockCommunityPostComments)(postId, false);
                            sonner_1.toast.success('Đã mở bình luận');
                            invalidateAll();
                        }
                        catch {
                            sonner_1.toast.error('Thao tác thất bại');
                        }
                    }}>
                      Mở bình luận
                    </button_1.Button>
                  </div>)}
              </card_1.Card>);
        })}
          {!items.length && !reportsQ.isLoading && (<p className="text-muted-foreground text-sm">Không có báo cáo.</p>)}
        </div>
      </tabs_1.TabsContent>

      <tabs_1.TabsContent value="audit">
        <card_1.Card className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="pb-2 pr-4">Thời gian</th>
                <th className="pb-2 pr-4">Hành động</th>
                <th className="pb-2">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {auditItems.map((a) => (<tr key={a._id} className="border-b border-border/50">
                  <td className="py-2 pr-4 whitespace-nowrap text-muted-foreground">
                    {a.createdAt ? new Date(a.createdAt).toLocaleString('vi-VN') : '—'}
                  </td>
                  <td className="py-2 pr-4 font-medium">{a.action}</td>
                  <td className="py-2 text-xs text-muted-foreground font-mono break-all">
                    {JSON.stringify(a.meta || {})}
                  </td>
                </tr>))}
            </tbody>
          </table>
          {!auditItems.length && !auditQ.isLoading && (<p className="text-muted-foreground text-sm py-4">Chưa có nhật ký.</p>)}
        </card_1.Card>
      </tabs_1.TabsContent>

      <tabs_1.TabsContent value="tools" className="space-y-6">
        <card_1.Card className="p-4 space-y-3">
          <h3 className="font-semibold">Theo ID bài viết</h3>
          <input_1.Input placeholder="Mongo ID bài viết" value={quickPostId} onChange={(e) => setQuickPostId(e.target.value)}/>
          <div className="flex flex-wrap gap-2">
            <button_1.Button type="button" variant="outline" size="sm" onClick={() => runQuick('Đã ẩn bài', () => (0, community_api_1.adminHideCommunityPost)(quickPostId.trim()))}>
              Ẩn
            </button_1.Button>
            <button_1.Button type="button" variant="outline" size="sm" onClick={() => runQuick('Đã hiện bài', () => (0, community_api_1.adminShowCommunityPost)(quickPostId.trim()))}>
              Hiện
            </button_1.Button>
            <button_1.Button type="button" variant="outline" size="sm" onClick={() => runQuick('Ghim', () => (0, community_api_1.adminFeatureCommunityPost)(quickPostId.trim(), true))}>
              Ghim nổi bật
            </button_1.Button>
            <button_1.Button type="button" variant="outline" size="sm" onClick={() => runQuick('Bỏ ghim', () => (0, community_api_1.adminFeatureCommunityPost)(quickPostId.trim(), false))}>
              Bỏ ghim
            </button_1.Button>
            <button_1.Button type="button" variant="outline" size="sm" onClick={() => runQuick('Khóa BL', () => (0, community_api_1.adminLockCommunityPostComments)(quickPostId.trim(), true))}>
              Khóa BL
            </button_1.Button>
            <button_1.Button type="button" variant="outline" size="sm" onClick={() => runQuick('Mở BL', () => (0, community_api_1.adminLockCommunityPostComments)(quickPostId.trim(), false))}>
              Mở BL
            </button_1.Button>
          </div>
        </card_1.Card>

        <card_1.Card className="p-4 space-y-3">
          <h3 className="font-semibold">Trạng thái cộng đồng — người dùng</h3>
          <input_1.Input placeholder="User ID (Mongo)" value={modUserId} onChange={(e) => setModUserId(e.target.value)}/>
          <select_1.Select value={modUserStatus} onValueChange={(v) => setModUserStatus(v)}>
            <select_1.SelectTrigger className="max-w-xs">
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="ACTIVE">ACTIVE</select_1.SelectItem>
              <select_1.SelectItem value="MUTED">MUTED</select_1.SelectItem>
              <select_1.SelectItem value="BANNED">BANNED</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
          <textarea_1.Textarea placeholder="Ghi chú nội bộ (tuỳ chọn)" value={modNote} onChange={(e) => setModNote(e.target.value)} className="min-h-[72px]"/>
          <button_1.Button type="button" onClick={async () => {
            if (!modUserId.trim()) {
                sonner_1.toast.error('Nhập user ID');
                return;
            }
            try {
                await (0, community_api_1.adminSetUserCommunityStatus)(modUserId.trim(), {
                    communityStatus: modUserStatus,
                    moderationNote: modNote || undefined,
                });
                sonner_1.toast.success('Đã cập nhật');
                invalidateAll();
            }
            catch {
                sonner_1.toast.error('Lỗi');
            }
        }}>
            Áp dụng trạng thái
          </button_1.Button>
        </card_1.Card>
      </tabs_1.TabsContent>
    </tabs_1.Tabs>);
}
//# sourceMappingURL=AdminCommunityReportsScreen.js.map