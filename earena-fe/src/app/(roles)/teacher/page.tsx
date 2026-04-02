'use client'; 

import Link from 'next/link';
import { TeacherDashboardSidebar } from '@/features/teacher/components/TeacherDashboardSidebar';
import { LayoutGrid, BookOpen, PlusCircle, FileText, Wallet, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/config/routes';

export default function TeacherDashboard() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      
      <main className="w-full lg:w-3/4 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-3 tracking-tight">
            <LayoutGrid className="text-primary w-8 h-8" />
            Bảng điều khiển
          </h1>
        </div>

        {/* 1. HERO BENTO BANNER */}
        <div className="bg-primary rounded-[2rem] p-8 md:p-10 text-primary-foreground shadow-sm relative overflow-hidden flex flex-col justify-center">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-background/20 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-bold mb-6 shadow-sm border border-white/10">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              Hệ thống quản lý mới
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight drop-shadow-sm">
              Chào mừng trở lại, Giảng viên!
            </h2>
            <p className="text-primary-foreground/90 font-medium text-lg max-w-2xl mb-8 leading-relaxed">
              Tính năng quản lý lớp học đã được nâng cấp thành hệ thống Khóa học (Courses) chuyên nghiệp. Khám phá ngay các công cụ mới để xây dựng và phân phối bài giảng của bạn.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={ROUTES.TEACHER.COURSES}>
                <Button size="lg" className="bg-background text-primary hover:bg-secondary font-bold h-14 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 text-base">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Quản lý Khóa học
                </Button>
              </Link>
              <Link href={ROUTES.TEACHER.CREATE_EXAM}>
                <Button size="lg" variant="outline" className="bg-primary hover:bg-primary/90 text-primary-foreground border-primary-foreground/30 font-bold h-14 px-8 rounded-xl transition-colors text-base hover:border-white">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Tạo đề thi mới
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. QUICK ACTIONS BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Action 1: Khóa học */}
          <Link href={ROUTES.TEACHER.COURSES} className="group">
            <div className="bg-card rounded-[2rem] p-6 border border-border/60 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all h-full flex flex-col">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Khoá học của tôi</h3>
              <p className="text-sm text-muted-foreground font-medium mb-6 flex-1">
                Quản lý lộ trình, học viên và cập nhật nội dung bài giảng.
              </p>
              <div className="flex items-center text-sm font-bold text-primary">
                Truy cập ngay <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Action 2: Đề thi */}
          <Link href={ROUTES.TEACHER.EXAMS} className="group">
            <div className="bg-card rounded-[2rem] p-6 border border-border/60 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all h-full flex flex-col">
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mb-5 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Kho đề thi</h3>
              <p className="text-sm text-muted-foreground font-medium mb-6 flex-1">
                Soạn thảo, quản lý ngân hàng câu hỏi và tạo ma trận đề.
              </p>
              <div className="flex items-center text-sm font-bold text-orange-500">
                Truy cập ngay <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Action 3: Ví doanh thu */}
          <Link href={ROUTES.TEACHER.WALLET} className="group">
            <div className="bg-card rounded-[2rem] p-6 border border-border/60 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all h-full flex flex-col">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-600 mb-5 group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Ví doanh thu</h3>
              <p className="text-sm text-muted-foreground font-medium mb-6 flex-1">
                Theo dõi thu nhập từ học viên và yêu cầu rút tiền.
              </p>
              <div className="flex items-center text-sm font-bold text-green-600">
                Truy cập ngay <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </main>

      <div className="w-full lg:w-1/4">
        <TeacherDashboardSidebar />
      </div>

    </div>
  );
}