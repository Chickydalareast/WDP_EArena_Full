'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Settings, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/config/routes';
import { useClassDetail } from '@/features/class-management/hooks/useClassDetail';
import { PendingMembersList } from '@/features/class-management/components/PendingMembersList';

export default function TeacherClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;

  const { data: classInfo, isLoading } = useClassDetail(classId);

  const handleCopyCode = () => {
    if (classInfo?.code) {
      navigator.clipboard.writeText(classInfo.code);
      toast.success('Đã sao chép mã lớp vào khay nhớ tạm!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-black p-8">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Đang tải không gian lớp học...</p>
      </div>
    );
  }

  if (!classInfo) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <Button 
          variant="ghost" 
          onClick={() => router.push(ROUTES.TEACHER.DASHBOARD)}
          className="text-muted-foreground hover:text-foreground pl-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại Dashboard
        </Button>

        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">

          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-blue-500" />
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {classInfo.name}
                </h1>
                {!classInfo.isPublic && (
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded-md uppercase">
                    Private
                  </span>
                )}
              </div>
              
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
                {classInfo.description || 'Chưa có mô tả cho lớp học này.'}
              </p>

              <div className="flex items-center gap-2 mt-4 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/50 inline-flex px-3 py-1.5 rounded-lg border">
                <Info className="w-4 h-4" />
                <span>Được tạo vào: {new Date(classInfo.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            <div className="shrink-0 bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col items-center justify-center min-w-[180px]">
              <span className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                Mã tham gia lớp
              </span>
              <div className="text-3xl font-black font-mono tracking-widest text-slate-900 dark:text-white mb-3">
                {classInfo.code}
              </div>
              <Button onClick={handleCopyCode} variant="default" size="sm" className="w-full">
                <Copy className="w-4 h-4 mr-2" /> Sao chép mã
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            <PendingMembersList classId={classId} />
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-500" />
                Cài đặt lớp học
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" disabled>
                  Chỉnh sửa thông tin (Coming soon)
                </Button>
                <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive hover:text-white border-destructive/30" disabled>
                  Khóa lớp học (Coming soon)
                </Button>
              </div>
            </div>
            
            <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-center text-slate-400 flex flex-col items-center justify-center min-h-[150px]">
              <p className="font-medium mb-1">Bài thi & Bài tập</p>
              <p className="text-sm opacity-70">Module Exam sẽ được nhúng vào đây</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}