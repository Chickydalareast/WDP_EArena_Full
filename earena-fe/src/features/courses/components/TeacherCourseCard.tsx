'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CourseBasic, CourseStatus } from '../types/course.schema';
import { formatCurrency } from '@/shared/lib/utils';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ROUTES } from '@/config/routes';
import { Settings, BookOpen, AlertCircle, Star, MessageSquare } from 'lucide-react';

interface TeacherCourseCardProps {
  course: CourseBasic;
}

// [CTO Dictionary]: Pattern chuẩn để quản lý các biến thể UI không cần if/else lồng nhau
const STATUS_CONFIG: Record<CourseStatus, { label: string; className: string }> = {
  [CourseStatus.DRAFT]: { label: 'Bản Nháp', className: 'bg-slate-500 text-white' },
  [CourseStatus.PENDING]: { label: 'Chờ Duyệt', className: 'bg-yellow-500 text-yellow-950 animate-pulse' },
  [CourseStatus.REJECTED]: { label: 'Bị Từ Chối', className: 'bg-red-500 text-white' },
  [CourseStatus.PUBLISHED]: { label: 'Đang On Air', className: 'bg-green-500 text-white shadow-green-500/50' },
  [CourseStatus.ARCHIVED]: { label: 'Lưu Trữ', className: 'bg-gray-400 text-white' },
};

export function TeacherCourseCard({ course }: TeacherCourseCardProps) {
  const safeImageUrl = course.coverImage?.url || 'https://placehold.co/600x400/EEE/31343C?text=EArena+Course';
  const status = STATUS_CONFIG[course.status] || STATUS_CONFIG[CourseStatus.DRAFT];

  return (
    <div className="group flex flex-col h-full bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* TOP: Ảnh & Status Badge */}
      <div className="relative aspect-video w-full bg-muted overflow-hidden">
        <Image
          src={safeImageUrl}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm z-10 ${status.className}`}>
          {status.label}
        </div>
        
        {course.status === CourseStatus.REJECTED && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 text-center z-20">
            <div className="flex flex-col items-center gap-2 text-white">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-xs font-medium">Cần chỉnh sửa lại nội dung</p>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM: Nội dung */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-base font-bold text-foreground line-clamp-2 mb-1" title={course.title}>
          {course.title}
        </h3>
        
        {/* --- BỔ SUNG HIỂN THỊ RATING CHO GIÁO VIÊN --- */}
        <div className="flex items-center gap-2 mb-2">
          {course.averageRating && course.averageRating > 0 ? (
            <>
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-bold text-foreground">
                {Number(course.averageRating).toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({course.totalReviews} lượt)
              </span>
            </>
          ) : (
             <span className="text-xs text-muted-foreground italic">Chưa có đánh giá</span>
          )}
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Giá bán: <strong className="text-primary">{formatCurrency(course.price)}</strong>
        </p>

        {/* --- CẬP NHẬT LƯỚI NÚT BẤM CỦA GIÁO VIÊN --- */}
        <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-border pointer-events-auto">
          
          <div className="grid grid-cols-2 gap-2">
            <Link 
              href={ROUTES.TEACHER.COURSE_BUILDER(course.id)}
              className="flex items-center justify-center gap-2 text-xs font-semibold py-2 px-3 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
            >
              <BookOpen className="w-4 h-4" /> Giáo án
            </Link>
            <Link 
              href={`/teacher/courses/${course.id}/settings`}
              className="flex items-center justify-center gap-2 text-xs font-semibold py-2 px-3 bg-muted text-muted-foreground rounded-lg hover:bg-foreground hover:text-background transition-colors"
            >
              <Settings className="w-4 h-4" /> Cài đặt
            </Link>
          </div>

          {/* Lối tắt nhảy thẳng đến khu vực Đánh giá trên trang Public để Reply */}
          <Link 
            href={`${ROUTES.PUBLIC.COURSE_DETAIL(course.slug)}#reviews`} // Gắn ID anchor #reviews
            className="flex items-center justify-center gap-2 text-xs font-semibold py-2 px-3 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-lg hover:bg-amber-500/20 transition-colors"
          >
            <MessageSquare className="w-4 h-4" /> Xem & Phản hồi đánh giá
          </Link>
          
        </div>
      </div>
    </div>
  );
}

export function TeacherCourseCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      <Skeleton className="relative aspect-video w-full rounded-none" />
      <div className="flex flex-col flex-1 p-4 space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-9 rounded-lg" />
            <Skeleton className="h-9 rounded-lg" />
          </div>
          <Skeleton className="h-9 rounded-lg" />
        </div>
      </div>
    </div>
  );
}