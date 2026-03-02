import { ProfileCard } from '@/shared/components/common/ProfileCard';
import { JoinClassByCodeForm } from '@/features/class-management/components/JoinClassByCodeForm';

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight">Khu vực Học tập</h1>
          <p className="text-slate-500 mt-2">Tìm kiếm lớp học và tham gia các bài thi.</p>
        </header>

        <ProfileCard />

        {/* Khối tham gia bằng mã */}
        <section>
          <JoinClassByCodeForm />
        </section>

        {/* Khối tìm kiếm cuộn vô tận */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-bold mb-6">Khám phá Lớp học Công khai</h2>
        </section>
      </div>
    </div>
  );
}