import { AdminShell } from '@/features/admin/components/AdminShell';
import { AdminClassesScreen } from '@/features/admin/screens/AdminClassesScreen';

export default function AdminClassesPage() {
  return (
    <AdminShell title="Quản trị lớp học" subtitle="Lock/Unlock • Dọn dữ liệu • Audit vận hành">
      <AdminClassesScreen />
    </AdminShell>
  );
}
