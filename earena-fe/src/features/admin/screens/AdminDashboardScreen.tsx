'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, GraduationCap, Layers, BookOpen } from 'lucide-react';
import { adminService } from '../api/admin.service';
import { StatCard } from '../components/StatCard';

export function AdminDashboardScreen() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: adminService.getOverview,
    staleTime: 1000 * 30, // 30s cache
  });

  if (isLoading) {
    return <div className="text-muted-foreground animate-pulse">Đang tải cấu trúc Dashboard…</div>;
  }
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-destructive font-semibold shadow-sm">
        Không thể kết nối đến máy chủ. Vui lòng thử lại.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Tổng người dùng"
          value={data.users.total}
          hint={`Học sinh: ${data.users.students} • Giáo viên: ${data.users.teachers}`}
          icon={<Users className="size-5 text-primary" />}
        />
        
        <StatCard
          label="Khóa học (MOOC)"
          value={data.courses?.total || 0}
          hint={
            <span className="flex items-center gap-1.5 flex-wrap">
              {data.courses?.pending > 0 ? (
                <span className="text-red-500 font-bold bg-red-500/10 px-1.5 rounded">
                  Chờ duyệt: {data.courses.pending}
                </span>
              ) : (
                <span>Chờ duyệt: 0</span>
              )}
              <span>• On-air: {data.courses?.published || 0}</span>
            </span>
          }
          icon={<BookOpen className="size-5 text-orange-500" />}
        />

        <StatCard
          label="Đề thi / Bài tập"
          value={data.exams.total}
          hint={`Đã publish: ${data.exams.published}`}
          icon={<GraduationCap className="size-5 text-blue-500" />}
        />
        
        <StatCard
          label="Ngân hàng câu hỏi"
          value={data.questions.total}
          hint={`Đã archive: ${data.questions.archived}`}
          icon={<Layers className="size-5 text-purple-500" />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card/60 p-6 shadow-sm">
          <div className="text-lg font-bold text-foreground">Gợi ý vận hành</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Đây là Admin Console theo chuẩn enterprise (RBAC + Cookie Auth). Các module CRUD nằm ở menu trái.
          </div>
          <ul className="mt-4 space-y-2 text-sm text-foreground">
            <li><span className="text-primary mr-2">♦</span> Ưu tiên xử lý các <strong className="text-red-500">Khóa học chờ duyệt</strong> để giáo viên có thể On-air nhanh chóng.</li>
            <li><span className="text-primary mr-2">♦</span> Khi có báo cáo vi phạm, sử dụng tính năng <strong>Gỡ khẩn cấp</strong> trong Quản trị Khóa học.</li>
            <li><span className="text-primary mr-2">♦</span> Khóa tài khoản nghi vấn ở mục <strong>Người dùng</strong>.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10 blur-xl"></div>
          <div className="text-lg font-bold text-primary">Chuẩn bảo mật</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Access/Refresh token lưu <b>httpOnly Cookie</b>. Server bật Helmet + ValidationPipe.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs font-semibold rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary shadow-sm">
              RBAC: ADMIN
            </span>
            <span className="text-xs font-semibold rounded-full border border-border bg-card/80 px-3 py-1 text-muted-foreground">
              Force Takedown
            </span>
            <span className="text-xs font-semibold rounded-full border border-border bg-card/80 px-3 py-1 text-muted-foreground">
              Direct Interceptor
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}