// src/app/(roles)/teacher/exams/page.tsx
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { TeacherExamsList } from '@/features/exam-builder/components/TeacherExamsList';

export const metadata = {
  title: 'Quản lý Đề thi | E-Arena',
};

export default function TeacherExamsListPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Action */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Kho Đề Thi Của Tôi</h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý, chỉnh sửa và giao đề kiểm tra cho các lớp học.
          </p>
        </div>
        
        <Link href="/teacher/exams/create">
          <Button className="font-bold bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            Tạo Đề Mới
          </Button>
        </Link>
      </div>

      {/* COMPONENT GỌI API THỰC TẾ TRẢ RA LIST */}
      <TeacherExamsList />
    </div>
  );
}