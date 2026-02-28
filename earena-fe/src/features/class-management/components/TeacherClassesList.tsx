'use client';

import { useRouter } from 'next/navigation';
import { Users, BookOpen, Loader2, ArrowRight } from 'lucide-react';
import { useTeacherClasses } from '../hooks/useTeacherClasses';
import { ROUTES } from '@/config/routes';

export function TeacherClassesList() {
  const router = useRouter();
  const { data: classes = [], isLoading, isError } = useTeacherClasses();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
        <p className="text-muted-foreground">Đang tải danh sách lớp học...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl border-red-200 bg-red-50 text-red-500">
        <p>Có lỗi xảy ra khi tải danh sách lớp. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <BookOpen className="w-10 h-10 text-slate-400 mb-3" />
        <p className="text-slate-500 font-medium">Bạn chưa tạo lớp học nào.</p>
        <p className="text-sm text-slate-400">Hãy khởi tạo lớp học đầu tiên ở form bên trên.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {classes.map((cls) => (
        <div
          key={cls.id}
          onClick={() => router.push(ROUTES.TEACHER.CLASS_DETAIL(cls.id))}
          className="group relative flex flex-col justify-between p-5 bg-card border rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
        >
          {/* Decorative element */}
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/80 group-hover:bg-primary transition-colors" />
          
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-foreground line-clamp-1" title={cls.name}>
                {cls.name}
              </h3>
              {cls.isPublic && (
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                  Public
                </span>
              )}
            </div>
            
            {cls.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {cls.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                Mã: {cls.code || 'N/A'}
              </span>
            </div>
            <div className="flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
              Quản lý <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}