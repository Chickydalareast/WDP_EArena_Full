import { AdminShell } from '@/features/admin/components/AdminShell';
import { AdminCoursesScreen } from '@/features/admin/screens/AdminCoursesScreen';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Duyệt Khóa Học | EArena Admin Console',
  description: 'Quản lý và kiểm duyệt khóa học trên nền tảng EArena',
};

export default function AdminCoursesPage() {
  return (
    <AdminShell 
      title="Quản lý Khóa học" 
      subtitle="Thẩm định, phê duyệt hoặc từ chối nội dung do giáo viên đăng tải"
    >
      <AdminCoursesScreen />
    </AdminShell>
  );
}