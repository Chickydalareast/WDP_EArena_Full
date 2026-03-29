import { AdminShell } from '@/features/admin/components/AdminShell';
import { AdminUsersScreen } from '@/features/admin/screens/AdminUsersScreen';

export default function AdminUsersPage() {
  return (
    <AdminShell title="Quản trị người dùng" subtitle="RBAC • Khóa/Ban • Reset mật khẩu • Quản lý role">
      <AdminUsersScreen />
    </AdminShell>
  );
}
