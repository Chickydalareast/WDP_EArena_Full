import { AdminShell } from '@/features/admin/components/AdminShell';
import { AdminExamsScreen } from '@/features/admin/screens/AdminExamsScreen';

export default function AdminExamsPage() {
  return (
    <AdminShell title="Quản trị đề thi" subtitle="Publish/Unpublish • Quản trị chuẩn enterprise">
      <AdminExamsScreen />
    </AdminShell>
  );
}
