// src/app/(roles)/teacher/exams/[examId]/builder/page.tsx
import Link from 'next/link';
import { ExamBuilderBoard } from '@/features/exam-builder/components/ExamBuilderBoard';

interface ExamBuilderPageProps {
  params: { examId: string };
}

export default function ExamBuilderPage({ params }: ExamBuilderPageProps) {
  const { examId } = params;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Header navigation cho Builder */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <Link 
              href="/teacher/exams" 
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title="Thoát khỏi trình soạn thảo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                Trình Soạn Thảo Đề Thi
              </h1>
              <span className="text-xs text-green-600 font-medium px-2 py-0.5 bg-green-50 border border-green-200 rounded-full">
                Trạng thái: Đang soạn thảo (Nháp)
              </span>
            </div>
          </div>
          
          <div className="text-sm font-mono text-slate-500 bg-slate-50 px-3 py-1 rounded border">
            ID: {examId}
          </div>
        </div>

        {/* --- [BUSINESS COMPONENT]: Bảng điều khiển thêm/bớt câu hỏi --- */}
        <ExamBuilderBoard />

      </div>
    </div>
  );
}