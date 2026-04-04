import { Metadata } from 'next';
import { AdminShell } from '@/features/admin/components/AdminShell';
import { AdminCommunityReportsScreen } from '@/features/admin/screens/AdminCommunityReportsScreen';

export const metadata: Metadata = {
  title: 'Community — Quản trị EArena',
};

export default function AdminCommunityPage() {
  return (
    <AdminShell
      title="Báo cáo Community"
      subtitle="Duyệt nội dung bị báo cáo từ cộng đồng học tập"
    >
      <AdminCommunityReportsScreen />
    </AdminShell>
  );
}
