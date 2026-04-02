import React from 'react';
import { StudentWelcomeBento } from '@/features/dashboard/components/StudentWelcomeBento';
import { StudentOngoingBento } from '@/features/dashboard/components/StudentOngoingBento';
import { StudentExploreBento } from '@/features/dashboard/components/StudentExploreBento';
import { Sparkles, Compass } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';

export const metadata = {
  title: 'Dashboard Học Tập | E-Arena',
  description: 'Trung tâm điều khiển tiến trình học tập của bạn.',
};

export default function StudentDashboardPage() {
  return (
    <div className="flex flex-col gap-8 w-full pb-10">
      {/* ROW 1: GREETING & WALLET FULL WIDTH */}
      <section className="grid grid-cols-1 gap-6 items-stretch">
        {/* Module 1: Greeting & Wallet & Long Arrow Link (Full 12 Cols) */}
        <div className="w-full flex">
          <StudentWelcomeBento />
        </div>
      </section>

      {/* ROW 2: MY COURSES */}
      <section className="flex flex-col gap-6 mt-2">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3 tracking-tight text-foreground">
            <Sparkles className="text-primary w-8 h-8 shrink-0" />
            Tiếp tục hành trình
          </h2>
          <Link href={ROUTES.STUDENT.MY_COURSES} className="text-primary font-bold text-sm hover:underline shrink-0">
            Xem tất cả khóa học
          </Link>
        </div>
        <StudentOngoingBento />
      </section>

      {/* ROW 3: EXPLORE COURSES */}
      <section className="flex flex-col gap-6 mt-6 pt-6 border-t border-border/60">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 tracking-tight text-foreground">
            <Compass className="text-primary w-7 h-7 shrink-0" />
            Khám phá khóa học mới
          </h2>
          <Link href={ROUTES.PUBLIC.COURSES} className="text-primary font-bold text-sm hover:underline shrink-0">
            Đến kho khóa học
          </Link>
        </div>
        <StudentExploreBento />
      </section>
    </div>
  );
}