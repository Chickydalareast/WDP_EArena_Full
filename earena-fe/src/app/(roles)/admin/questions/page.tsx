import { AdminShell } from '@/features/admin/components/AdminShell';
import { AdminQuestionsScreen } from '@/features/admin/screens/AdminQuestionsScreen';

export default function AdminQuestionsPage() {
  return (
    <AdminShell title="Ngân hàng câu hỏi" subtitle="Archive/Restore • Kiểm soát chất lượng nội dung">
      <AdminQuestionsScreen />
    </AdminShell>
  );
}
