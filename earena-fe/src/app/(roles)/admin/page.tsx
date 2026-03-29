import { AdminShell } from '@/features/admin/components/AdminShell';
import { AdminDashboardScreen } from '@/features/admin/screens/AdminDashboardScreen';

export default function AdminDashboardPage() {
  return (
    <AdminShell
      title="Bảng điều khiển"
      subtitle="Tổng quan vận hành hệ thống ôn thi THPTQG (Enterprise Console)"
    >
      <AdminDashboardScreen />
    </AdminShell>
  );
}
