import { ProfileCard } from '@/shared/components/common/ProfileCard';
import { CreateClassForm } from '@/features/class-management/components/CreateClassForm';
import { TeacherClassesList } from '@/features/class-management/components/TeacherClassesList';

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Trung tâm Điều hành (Giáo Viên)
          </h1>
          <p className="text-slate-500 mt-2">
            Quản lý lớp học, ngân hàng câu hỏi và cấu hình đề thi.
          </p>
        </header>

        <section>
          <ProfileCard />
        </section>

        {/* Khối Tạo Lớp */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <CreateClassForm />
        </section>

        {/* Khối Danh sách Lớp đã tạo */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Lớp học của bạn
          </h2>
          <TeacherClassesList />
        </section>

      </div>
    </div>
  );
}