import { AdminShell } from '@/features/admin/components/AdminShell';
import { AdminTeacherVerificationScreen } from '@/features/admin/screens/AdminTeacherVerificationScreen';

export default function AdminTeachersVerificationPage() {
  return (
    <AdminShell title="Duyệt giáo viên" subtitle="Xác minh hồ sơ giáo viên (tick xanh uy tín) – chống spam & nâng chất lượng hệ thống">
      <AdminTeacherVerificationScreen />
    </AdminShell>
  );
}
