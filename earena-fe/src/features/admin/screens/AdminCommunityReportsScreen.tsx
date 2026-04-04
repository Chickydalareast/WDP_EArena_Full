'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminCommunityReports,
  resolveAdminCommunityReport,
  adminHideCommunityPost,
  adminShowCommunityPost,
  adminFeatureCommunityPost,
  adminLockCommunityPostComments,
  adminSetUserCommunityStatus,
  getAdminCommunityAudit,
} from '@/features/community/api/community-api';
import { ROUTES } from '@/config/routes';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { toast } from 'sonner';
import { ExternalLink, Loader2 } from 'lucide-react';

type ReportItem = {
  id: string;
  reporter?: { fullName?: string; email?: string } | null;
  targetType: string;
  targetId: string;
  postId?: string;
  reason: string;
  status: string;
  createdAt?: string;
  resolutionNote?: string;
  targetPreview?: {
    kind: 'POST' | 'COMMENT';
    postId?: string;
    excerpt?: string;
    missing?: boolean;
    isRemoved?: boolean;
  } | null;
};

type AuditItem = {
  _id: string;
  action: string;
  actorId?: { toString: () => string };
  meta?: Record<string, unknown>;
  createdAt?: string;
};

export function AdminCommunityReportsScreen() {
  const qc = useQueryClient();
  const [reportStatus, setReportStatus] = useState<string>('PENDING');
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [quickPostId, setQuickPostId] = useState('');
  const [modUserId, setModUserId] = useState('');
  const [modUserStatus, setModUserStatus] = useState<'ACTIVE' | 'MUTED' | 'BANNED'>('MUTED');
  const [modNote, setModNote] = useState('');

  const reportsQ = useQuery({
    queryKey: ['admin-community-reports', reportStatus],
    queryFn: () =>
      getAdminCommunityReports({
        ...(reportStatus === 'ALL' ? {} : { status: reportStatus }),
        limit: 50,
      }),
  });

  const auditQ = useQuery({
    queryKey: ['admin-community-audit'],
    queryFn: () => getAdminCommunityAudit({ page: 1, limit: 40 }),
  });

  const resolveMu = useMutation({
    mutationFn: ({
      id,
      status,
      resolutionNote,
    }: {
      id: string;
      status: 'REVIEWED' | 'DISMISSED';
      resolutionNote?: string;
    }) => resolveAdminCommunityReport(id, { status, resolutionNote }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-community-reports'] });
      qc.invalidateQueries({ queryKey: ['admin-community-audit'] });
      toast.success('Đã cập nhật báo cáo');
    },
    onError: () => toast.error('Lỗi'),
  });

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['admin-community-reports'] });
    qc.invalidateQueries({ queryKey: ['admin-community-audit'] });
  };

  const pack = reportsQ.data as { items?: ReportItem[] } | undefined;
  const items = pack?.items || [];

  const auditPack = auditQ.data as { items?: AuditItem[] } | undefined;
  const auditItems = auditPack?.items || [];

  const postIdFromReport = (r: ReportItem) =>
    r.postId || r.targetPreview?.postId || (r.targetType === 'POST' ? r.targetId : undefined);

  const runQuick = async (
    label: string,
    fn: () => Promise<unknown>,
  ) => {
    if (!quickPostId.trim()) {
      toast.error('Nhập ID bài viết');
      return;
    }
    try {
      await fn();
      toast.success(label);
      invalidateAll();
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  return (
    <Tabs defaultValue="reports" className="space-y-6">
      <TabsList>
        <TabsTrigger value="reports">Báo cáo</TabsTrigger>
        <TabsTrigger value="audit">Nhật ký moderation</TabsTrigger>
        <TabsTrigger value="tools">Thao tác nhanh</TabsTrigger>
      </TabsList>

      <TabsContent value="reports" className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">Trạng thái:</span>
          <Select value={reportStatus} onValueChange={setReportStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Chờ xử lý</SelectItem>
              <SelectItem value="REVIEWED">Đã xử lý</SelectItem>
              <SelectItem value="DISMISSED">Đã bỏ qua</SelectItem>
              <SelectItem value="ALL">Tất cả</SelectItem>
            </SelectContent>
          </Select>
          {reportsQ.isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        </div>

        <div className="space-y-4">
          {items.map((r) => {
            const postId = postIdFromReport(r);
            const postHref = postId ? ROUTES.PUBLIC.COMMUNITY_POST(postId) : null;
            const note = resolutionNotes[r.id] ?? '';

            return (
              <Card key={r.id} className="p-4 space-y-3">
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
                {r.targetPreview?.excerpt != null && (
                  <blockquote className="text-sm border-l-2 pl-3 text-muted-foreground line-clamp-4">
                    {r.targetPreview.excerpt || '(Không lấy được nội dung)'}
                  </blockquote>
                )}
                <div className="flex flex-wrap gap-2">
                  {postHref && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={postHref} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        Mở bài
                      </Link>
                    </Button>
                  )}
                  {r.status === 'PENDING' && (
                    <>
                      <Textarea
                        placeholder="Ghi chú xử lý (tuỳ chọn)"
                        className="min-h-[60px] w-full sm:max-w-md"
                        value={note}
                        onChange={(e) =>
                          setResolutionNotes((prev) => ({ ...prev, [r.id]: e.target.value }))
                        }
                      />
                      <div className="flex flex-wrap gap-2 w-full">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            resolveMu.mutate({
                              id: r.id,
                              status: 'DISMISSED',
                              resolutionNote: note || undefined,
                            })
                          }
                        >
                          Bỏ qua
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            resolveMu.mutate({
                              id: r.id,
                              status: 'REVIEWED',
                              resolutionNote: note || undefined,
                            })
                          }
                        >
                          Đánh dấu đã xử lý
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {postId && r.status === 'PENDING' && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        try {
                          await adminHideCommunityPost(postId);
                          toast.success('Đã ẩn bài');
                          invalidateAll();
                        } catch {
                          toast.error('Thao tác thất bại');
                        }
                      }}
                    >
                      Ẩn bài
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        try {
                          await adminShowCommunityPost(postId);
                          toast.success('Đã hiện bài');
                          invalidateAll();
                        } catch {
                          toast.error('Thao tác thất bại');
                        }
                      }}
                    >
                      Hiện bài
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        try {
                          await adminFeatureCommunityPost(postId, true);
                          toast.success('Đã bật nổi bật');
                          invalidateAll();
                        } catch {
                          toast.error('Thao tác thất bại');
                        }
                      }}
                    >
                      Ghim nổi bật
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        try {
                          await adminFeatureCommunityPost(postId, false);
                          toast.success('Đã tắt nổi bật');
                          invalidateAll();
                        } catch {
                          toast.error('Thao tác thất bại');
                        }
                      }}
                    >
                      Bỏ ghim
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        try {
                          await adminLockCommunityPostComments(postId, true);
                          toast.success('Đã khóa bình luận');
                          invalidateAll();
                        } catch {
                          toast.error('Thao tác thất bại');
                        }
                      }}
                    >
                      Khóa bình luận
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        try {
                          await adminLockCommunityPostComments(postId, false);
                          toast.success('Đã mở bình luận');
                          invalidateAll();
                        } catch {
                          toast.error('Thao tác thất bại');
                        }
                      }}
                    >
                      Mở bình luận
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
          {!items.length && !reportsQ.isLoading && (
            <p className="text-muted-foreground text-sm">Không có báo cáo.</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="audit">
        <Card className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="pb-2 pr-4">Thời gian</th>
                <th className="pb-2 pr-4">Hành động</th>
                <th className="pb-2">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {auditItems.map((a) => (
                <tr key={a._id} className="border-b border-border/50">
                  <td className="py-2 pr-4 whitespace-nowrap text-muted-foreground">
                    {a.createdAt ? new Date(a.createdAt).toLocaleString('vi-VN') : '—'}
                  </td>
                  <td className="py-2 pr-4 font-medium">{a.action}</td>
                  <td className="py-2 text-xs text-muted-foreground font-mono break-all">
                    {JSON.stringify(a.meta || {})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!auditItems.length && !auditQ.isLoading && (
            <p className="text-muted-foreground text-sm py-4">Chưa có nhật ký.</p>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="tools" className="space-y-6">
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold">Theo ID bài viết</h3>
          <Input
            placeholder="Mongo ID bài viết"
            value={quickPostId}
            onChange={(e) => setQuickPostId(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                runQuick('Đã ẩn bài', () => adminHideCommunityPost(quickPostId.trim()))
              }
            >
              Ẩn
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                runQuick('Đã hiện bài', () => adminShowCommunityPost(quickPostId.trim()))
              }
            >
              Hiện
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                runQuick('Ghim', () => adminFeatureCommunityPost(quickPostId.trim(), true))
              }
            >
              Ghim nổi bật
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                runQuick('Bỏ ghim', () => adminFeatureCommunityPost(quickPostId.trim(), false))
              }
            >
              Bỏ ghim
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                runQuick('Khóa BL', () =>
                  adminLockCommunityPostComments(quickPostId.trim(), true),
                )
              }
            >
              Khóa BL
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                runQuick('Mở BL', () =>
                  adminLockCommunityPostComments(quickPostId.trim(), false),
                )
              }
            >
              Mở BL
            </Button>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <h3 className="font-semibold">Trạng thái cộng đồng — người dùng</h3>
          <Input
            placeholder="User ID (Mongo)"
            value={modUserId}
            onChange={(e) => setModUserId(e.target.value)}
          />
          <Select
            value={modUserStatus}
            onValueChange={(v) => setModUserStatus(v as typeof modUserStatus)}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">ACTIVE</SelectItem>
              <SelectItem value="MUTED">MUTED</SelectItem>
              <SelectItem value="BANNED">BANNED</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Ghi chú nội bộ (tuỳ chọn)"
            value={modNote}
            onChange={(e) => setModNote(e.target.value)}
            className="min-h-[72px]"
          />
          <Button
            type="button"
            onClick={async () => {
              if (!modUserId.trim()) {
                toast.error('Nhập user ID');
                return;
              }
              try {
                await adminSetUserCommunityStatus(modUserId.trim(), {
                  communityStatus: modUserStatus,
                  moderationNote: modNote || undefined,
                });
                toast.success('Đã cập nhật');
                invalidateAll();
              } catch {
                toast.error('Lỗi');
              }
            }}
          >
            Áp dụng trạng thái
          </Button>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
