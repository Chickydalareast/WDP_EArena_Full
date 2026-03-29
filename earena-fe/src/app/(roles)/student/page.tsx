'use client'; 

import React from 'react';
import { Search, Sparkles, PlayCircle, Bolt, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboardPage() {
  return (
    <>
      {/* 1. KHỐI HERO (Đã mở rộng full width do bỏ form Join Class) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 relative rounded-2xl overflow-hidden min-h-[320px] bg-primary flex flex-col justify-center items-center text-center p-8 shadow-sm">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="relative z-10 w-full max-w-2xl flex flex-col gap-6">
            <h1 className="text-primary-foreground text-3xl md:text-5xl font-extrabold tracking-tight">
              Chinh phục 9+ THPT Quốc Gia
            </h1>
            <p className="text-primary-foreground/90 text-lg font-medium">
              Tìm kiếm khóa học phù hợp nhất với lộ trình của bạn
            </p>
            <div className="relative group mx-auto w-full max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-6 h-6" />
              <input 
                className="w-full h-14 pl-12 pr-4 rounded-xl border-none bg-background shadow-2xl focus:ring-4 focus:ring-background/30 text-foreground placeholder:text-muted-foreground outline-none transition-all font-medium" 
                placeholder="Tìm kiếm khóa học, bài giảng..." 
                type="text"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. KHỐI DANH SÁCH KHÓA HỌC (Placeholder) */}
      <section className="flex flex-col gap-6 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
            <Sparkles className="text-primary" size={28} />
            Khóa học của tôi
          </h2>
          <Link href="/student/courses" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
            Xem tất cả
          </Link>
        </div>
        
        <div className="bg-card border border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <BookOpen size={32} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Dữ liệu đang được đồng bộ</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Hệ thống đang được nâng cấp sang mô hình Khóa Học (Course). Các lộ trình học tập của bạn sẽ sớm được cập nhật tại đây.
          </p>
        </div>
      </section>

      {/* 3. KHỐI KHÁM PHÁ (Placeholder) */}
      <section className="flex flex-col gap-6 mt-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
          <PlayCircle className="text-primary" size={28} />
          Khám phá khóa học mới
        </h2>
        
        <div className="bg-card rounded-2xl border border-border shadow-sm p-12 flex flex-col items-center justify-center text-center">
           <p className="text-muted-foreground font-medium">Chức năng tìm kiếm và đăng ký khóa học đang được hoàn thiện...</p>
        </div>
      </section>

      {/* 4. FOOTER PROMO BANNER */}
      <section className="mt-8 mb-8">
        <div className="bg-slate-900 rounded-2xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group border border-slate-800">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700"></div>
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">Bứt phá điểm số từ chính lỗi sai!</h2>
            <p className="text-slate-400 text-lg max-w-xl">Hệ thống AI phân tích lỗ hổng kiến thức và đề xuất bài tập cá nhân hóa giúp bạn tiến bộ mỗi ngày.</p>
          </div>
          <button className="relative z-10 shrink-0 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/40 flex items-center gap-2">
            <Bolt size={20} />
            Tạo đề luyện tập
          </button>
        </div>
      </section>
    </>
  );
}