import { AdminShell } from '@/features/admin/components/AdminShell';
import { AdminPricingPlansScreen } from '@/features/admin/screens/AdminPricingPlansScreen';

export default function AdminPricingPage() {
  return (
    <AdminShell title="Gói dịch vụ" subtitle="Quản lý pricing plans (Free/Pro/Enterprise) – phục vụ vận hành hệ thống">
      <AdminPricingPlansScreen />
    </AdminShell>
  );
}
