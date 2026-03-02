'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, GraduationCap, Layers, BookOpen } from 'lucide-react';
import { adminService } from '../api/admin.service';
import { StatCard } from '../components/StatCard';

export function AdminDashboardScreen() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: adminService.getOverview,
    staleTime: 1000 * 30,
  });

  if (isLoading) {
    return <div className="text-muted-foreground">Đang tải dashboard…</div>;
  }
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-destructive">
        Không thể tải dữ liệu dashboard. Vui lòng thử lại.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Tổng người dùng"
          value={data.users.total}
          hint={`Học sinh: ${data.users.students} • Giáo viên: ${data.users.teachers} • Admin: ${data.users.admins}`}
          icon={<Users className="size-5 text-primary" />}
        />
        <StatCard
          label="Đề thi"
          value={data.exams.total}
          hint={`Đã publish: ${data.exams.published}`}
          icon={<GraduationCap className="size-5 text-primary" />}
        />
        <StatCard
          label="Ngân hàng câu hỏi"
          value={data.questions.total}
          hint={`Đã archive: ${data.questions.archived}`}
          icon={<Layers className="size-5 text-primary" />}
        />
        <StatCard
          label="Lớp học"
          value={data.classes.total}
          hint={`Đang khóa: ${data.classes.locked}`}
          icon={<BookOpen className="size-5 text-primary" />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card/60 p-6">
          <div className="text-lg font-bold">Gợi ý vận hành</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Đây là Admin Console theo chuẩn enterprise (RBAC + Cookie Auth). Các module CRUD nằm ở menu trái.
          </div>
          <ul className="mt-4 space-y-2 text-sm text-foreground">
            <li>• Khóa tài khoản nghi vấn ở mục <b>Người dùng</b>.</li>
            <li>• Toggle publish đề thi ở mục <b>Đề thi</b>.</li>
            <li>• Archive câu hỏi vi phạm ở mục <b>Ngân hàng câu hỏi</b>.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-6">
          <div className="text-lg font-bold">Chuẩn bảo mật</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Access/Refresh token lưu <b>httpOnly Cookie</b>. Server bật Helmet + ValidationPipe.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">
              RBAC: ADMIN
            </span>
            <span className="text-xs rounded-full border border-border bg-card/60 px-3 py-1 text-muted-foreground">
              Refresh Queue
            </span>
            <span className="text-xs rounded-full border border-border bg-card/60 px-3 py-1 text-muted-foreground">
              Global Guard
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
