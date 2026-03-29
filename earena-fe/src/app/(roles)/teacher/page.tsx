'use client'; 

import { TeacherDashboardSidebar } from '@/features/teacher/components/TeacherDashboardSidebar';
import { LayoutGrid, Filter, ArrowUpDown } from 'lucide-react';

export default function TeacherDashboard() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      
      <main className="w-full lg:w-3/4 space-y-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <LayoutGrid className="text-primary" size={28} />
            Khóa học của tôi
          </h1>
          <div className="flex gap-2">
            <button className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition">
              <Filter size={20} />
            </button>
            <button className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition">
              <ArrowUpDown size={20} />
            </button>
          </div>
        </div>

        <div className="bg-card border border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <LayoutGrid size={32} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Hệ thống đang được nâng cấp</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Tính năng quản lý lớp học đang được chuyển đổi sang hệ thống Khóa Học (Course) để tối ưu trải nghiệm giảng dạy. Vui lòng quay lại sau!
          </p>
        </div>
      </main>

      <div className="w-full lg:w-1/4">
        <TeacherDashboardSidebar />
      </div>

    </div>
  );
}