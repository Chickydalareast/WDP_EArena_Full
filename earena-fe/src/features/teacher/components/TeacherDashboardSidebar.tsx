import React from 'react';
import Link from 'next/link';
import { FolderOpen, FileEdit, BarChart2 } from 'lucide-react';

const MENU_ITEMS = [
  {
    href: '/teacher/questions', // Chuẩn bị cho Phase sau
    icon: FolderOpen,
    title: 'Ngân hàng câu hỏi',
    subtitle: 'Quản lý thư mục, Import',
    colorClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  {
    href: '/teacher/exams', // ĐÂY LÀ ENTRY POINT CHO PHASE 5
    icon: FileEdit,
    title: 'Kho Đề Thi',
    subtitle: 'Quản lý, Soạn đề & Ma trận',
    colorClass: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  },
  {
    href: '/teacher/statistics',
    icon: BarChart2,
    title: 'Thống kê chung',
    subtitle: 'Báo cáo điểm số',
    colorClass: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  },
];

export function TeacherDashboardSidebar() {
  return (
    <aside className="w-full flex flex-col gap-6">
      {/* Khối 1: Công cụ giảng dạy (Sử dụng Next.js Link) */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-5">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Công cụ giảng dạy
        </h3>
        <div className="space-y-3">
          {MENU_ITEMS.map((item, index) => (
            <Link 
              key={index}
              href={item.href}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group bg-muted/30"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors ${item.colorClass}`}>
                <item.icon size={20} />
              </div>
              <div className="text-left">
                <span className="block font-semibold text-foreground text-sm">{item.title}</span>
                <span className="block text-xs text-muted-foreground">{item.subtitle}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Khối 2: Hoạt động gần đây (Mock data tĩnh chờ API) */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-5 flex-1">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Hoạt động gần đây
          </h3>
          <span className="text-xs text-primary font-medium hover:underline cursor-pointer">
            Xem tất cả
          </span>
        </div>
        
        <div className="relative pl-4 border-l-2 border-border space-y-8">
          <div className="relative">
            <div className="absolute -left-[21px] top-0 w-3 h-3 bg-primary rounded-full ring-4 ring-card"></div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">10 phút trước</span>
              <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded">Join Request</span>
            </div>
            <p className="text-sm text-foreground mb-2">
              <span className="font-bold">Nguyễn Văn An</span> xin tham gia lớp <span className="font-medium text-primary">Toán 12A1</span>.
            </p>
            <button className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-medium hover:bg-primary/90 transition shadow-sm shadow-primary/30">
              Duyệt nhanh
            </button>
          </div>

          <div className="relative">
            <div className="absolute -left-[21px] top-0 w-3 h-3 bg-orange-400 rounded-full ring-4 ring-card"></div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">2 giờ trước</span>
              <span className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 text-[10px] font-bold px-1.5 py-0.5 rounded">Phúc khảo</span>
            </div>
            <p className="text-sm text-foreground">
              <span className="font-bold">Trần Thu Hà</span> yêu cầu phúc khảo bài thi <span className="font-medium">Giữa kỳ II</span>.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-[21px] top-0 w-3 h-3 bg-green-400 rounded-full ring-4 ring-card"></div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Hôm qua</span>
              <span className="bg-muted text-muted-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">Hệ thống</span>
            </div>
            <p className="text-sm text-foreground">
              Đã tạo xong <span className="font-bold text-green-600 dark:text-green-400">Ma trận đề thi</span> cho kỳ thi thử.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}