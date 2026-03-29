import { AdminShell } from '@/features/admin/components/AdminShell';
import { AdminBusinessDashboardScreen } from '@/features/admin/screens/AdminBusinessDashboardScreen';

export default function AdminBusinessPage() {
  return (
    <AdminShell title="Business Dashboard" subtitle="Theo dõi doanh thu & chỉ số vận hành (dành cho chủ hệ thống)">
      <AdminBusinessDashboardScreen />
    </AdminShell>
  );
}
