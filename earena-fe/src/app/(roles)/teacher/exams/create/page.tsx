// src/app/(roles)/teacher/exams/create/page.tsx
import Link from 'next/link';
import { InitExamForm } from '@/features/exam-builder/components/InitExamForm';

export default function CreateExamPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Tạo Đề Thi Mới</h1>
            <p className="text-muted-foreground mt-1">Khởi tạo thông tin cơ bản trước khi chọn câu hỏi.</p>
          </div>
          <Link href="/teacher/exams" className="text-primary hover:opacity-90 text-sm font-medium transition-colors">
            &larr; Hủy và quay lại
          </Link>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-lg">
            <InitExamForm />
          </div>
        </div>
      </div>
    </div>
  );
}
