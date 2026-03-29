import { AdminShell } from '@/features/admin/components/AdminShell';
import { AdminTaxonomyScreen } from '@/features/admin/screens/AdminTaxonomyScreen';

export default function AdminTaxonomyPage() {
  return (
    <AdminShell title="Danh mục kiến thức" subtitle="Môn học • Cây kiến thức • Chuẩn hóa taxonomy">
      <AdminTaxonomyScreen />
    </AdminShell>
  );
}
