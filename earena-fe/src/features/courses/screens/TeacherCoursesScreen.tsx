'use client';

import { useState } from 'react';
import { useTeacherCourses } from '../hooks/useTeacherCourses';
import { TeacherCourseCard, TeacherCourseCardSkeleton } from '../components/TeacherCourseCard';
import { CreateCourseModal } from '../components/CreateCourseModal';
import { Button } from '@/shared/components/ui/button';
import { Plus, GraduationCap, AlertCircle, BookOpen } from 'lucide-react';

export function TeacherCoursesScreen() {
  const { data: courses, isLoading, isError } = useTeacherCourses();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const courseList = Array.isArray(courses) ? courses : (courses?.data || []);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
            <GraduationCap className="text-primary w-8 h-8" />
            Khóa học của tôi
          </h1>
          <p className="text-muted-foreground mt-1">Quản lý và thiết kế các khóa học trực tuyến của bạn.</p>
        </div>
        
        <Button onClick={() => setIsModalOpen(true)} className="rounded-full shadow-md font-bold px-6">
          <Plus className="mr-2 w-5 h-5" /> Tạo Khóa Học
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <TeacherCourseCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 bg-red-50/50 rounded-xl border border-red-100">
          <AlertCircle className="w-10 h-10 mb-2 text-red-500" />
          <p className="text-red-600 font-medium">Không thể tải dữ liệu khóa học. Vui lòng thử lại.</p>
        </div>
      ) : courseList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-muted/20 rounded-xl border border-dashed border-border">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">Chưa có khóa học nào</h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-center">
            Bạn chưa tạo khóa học nào trên nền tảng. Hãy bắt đầu bằng cách tạo khóa học đầu tiên của mình.
          </p>
          <Button onClick={() => setIsModalOpen(true)} variant="outline">
            Tạo khóa học ngay
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courseList.map((course: { id?: string; _id?: string; [key: string]: unknown }, index: number) => (
            <TeacherCourseCard 
              key={course.id || course._id || `course-fallback-${index}`} 
              course={course} 
            />
          ))}
        </div>
      )}

      <CreateCourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}