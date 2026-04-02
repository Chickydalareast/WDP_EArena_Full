'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useTeacherExams } from '../hooks/useTeacherExams';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Plus, Edit3, Clock, FileText, CheckCircle2, Eye, Calendar, BookOpen } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// [CTO FIX]: Chuẩn hóa chính xác 100% với Backend JSON Payload
interface ExamListItem {
  id: string;
  title: string;
  description?: string;
  teacherId: string;
  subjectId: string;
  totalScore: number;
  duration?: number; // Có thể null/undefined theo API
  isPublished: boolean;
  type: string;
  mode: string;
  folderId?: string;
  createdAt: string;
  defaultPaperId?: string;
}

export function TeacherExamsList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useTeacherExams({ page, limit: 9 }); // Lấy 9 items cho đẹp grid 3 cột

  // Xử lý bóc tách data an toàn đề phòng các lớp bọc response khác nhau
  const rawData = data?.data || data; 
  const exams: ExamListItem[] = rawData?.items || (Array.isArray(rawData) ? rawData : []);
  const meta = rawData?.meta;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-3xl p-6 flex flex-col h-[280px]">
            <div className="flex justify-between items-start mb-4 gap-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-20 rounded-full shrink-0" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-6" />
            <div className="mt-auto space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-11 w-full mt-4 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12 text-center text-destructive bg-destructive/5 rounded-3xl border border-destructive/20">
        <p className="font-bold text-lg">Lỗi khi tải danh sách đề thi.</p>
        <p className="text-sm mt-2 opacity-80">Vui lòng kiểm tra lại đường truyền và thử lại.</p>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="bg-card rounded-[2.5rem] border border-border/50 p-16 text-center shadow-sm">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <Plus className="w-12 h-12" />
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-foreground mb-4">Chưa có đề thi nào</h3>
        <p className="text-muted-foreground mb-10 max-w-lg mx-auto text-lg">
          Bạn chưa tạo đề thi nào. Hãy bắt đầu bằng cách khởi tạo một vỏ đề trống để thêm các câu hỏi.
        </p>
        <Link href="/teacher/exams/create">
          <Button size="lg" className="font-bold h-14 px-8 rounded-full shadow-lg shadow-primary/25 hover:scale-105 transition-transform">
            Bắt đầu tạo đề ngay
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* EXAMS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-card rounded-3xl border border-border/60 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 p-6 flex flex-col relative group">

            {/* Header: Title & Status Badge */}
            <div className="flex justify-between items-start gap-3 mb-3">
              <h3 className="font-extrabold text-xl text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                {exam.title}
              </h3>
              <div className="shrink-0">
                {exam.isPublished ? (
                  <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã xuất bản
                  </span>
                ) : (
                  <span className="bg-secondary text-secondary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Bản nháp
                  </span>
                )}
              </div>
            </div>

            {/* Description (Nếu có) */}
            {exam.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 font-medium">
                    {exam.description}
                </p>
            )}

            {/* Metadata (Tận dụng toàn bộ data API) */}
            <div className="space-y-2.5 mb-6 mt-auto text-sm font-medium text-muted-foreground">
              {exam.createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Ngày tạo: <span className="text-foreground">{format(new Date(exam.createdAt), 'dd/MM/yyyy')}</span>
                  </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Thời gian: <span className="text-foreground">{exam.duration ? `${exam.duration} phút` : 'Chưa cấu hình'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Tổng điểm: <span className="text-foreground">{exam.totalScore}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-400" />
                Loại đề: <span className="text-foreground">{exam.type === 'PRACTICE' ? 'Luyện tập' : exam.type}</span>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-5 border-t border-border/50">
              <Link
                href={`/teacher/exams/${exam.id}/builder?paperId=${exam.defaultPaperId || ''}&isPublished=${exam.isPublished}`}
                className="block w-full"
              >
                <Button
                  variant={exam.isPublished ? "outline" : "default"}
                  className={cn(
                      "w-full rounded-xl font-bold h-11 transition-all",
                      !exam.isPublished && "shadow-md shadow-primary/20"
                  )}
                >
                  {exam.isPublished ? (
                    <><Eye className="w-4 h-4 mr-2" /> Xem chi tiết đề</>
                  ) : (
                    <><Edit3 className="w-4 h-4 mr-2" /> Tiếp tục soạn đề</>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-border/50">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => {
                setPage(p => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-semibold rounded-full px-6 h-12"
          >
            Trang trước
          </Button>
          <span className="text-sm font-bold bg-secondary px-4 py-2 rounded-full text-secondary-foreground">
            {page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= meta.totalPages}
            onClick={() => {
                setPage(p => p + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-semibold rounded-full px-6 h-12"
          >
            Trang tiếp
          </Button>
        </div>
      )}
    </div>
  );
}