'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CourseBasic, CourseStatus } from '../types/course.schema';
import { formatCurrency, cn } from '@/shared/lib/utils';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ROUTES } from '@/config/routes';
import { useState } from 'react';
import {
  Settings,
  BookOpen,
  AlertCircle,
  Star,
  MessageSquare,
  MoreVertical,
  Users,
  ExternalLink,
  GraduationCap,
  ArrowRight,
  Megaphone,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/button';
import { PromoteCourseModal } from './PromoteCourseModal';

interface TeacherCourseCardProps {
  course: CourseBasic;
}

const STATUS_CONFIG: Record<CourseStatus, { label: string; className: string }> = {
  [CourseStatus.DRAFT]: { label: 'Bản Nháp', className: 'bg-slate-500 text-white' },
  [CourseStatus.PENDING_REVIEW]: { label: 'Chờ Duyệt', className: 'bg-yellow-500 text-yellow-950 animate-pulse' },
  [CourseStatus.REJECTED]: { label: 'Bị Từ Chối', className: 'bg-red-500 text-white' },
  [CourseStatus.PUBLISHED]: { label: 'Đang On Air', className: 'bg-green-500 text-white shadow-green-500/50' },
  [CourseStatus.ARCHIVED]: { label: 'Lưu Trữ', className: 'bg-gray-500 text-white' },
};

export function TeacherCourseCard({ course }: TeacherCourseCardProps) {
  const [promoteOpen, setPromoteOpen] = useState(false);
  // Đồng bộ key PENDING_REVIEW theo đúng schema thay vì PENDING
  const statusKey = Object.keys(STATUS_CONFIG).includes(course.status) 
    ? course.status 
    : CourseStatus.DRAFT;
  const status = STATUS_CONFIG[statusKey];

  return (
    <div className="group flex flex-col h-full bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      
      {/* TOP: Ảnh & Status Badge (Clickable Zone 1) */}
      <Link href={ROUTES.TEACHER.COURSE_DETAIL(course.id)} className="relative aspect-video w-full bg-muted overflow-hidden flex items-center justify-center">
        {course.coverImage?.url ? (
          <Image
            src={course.coverImage.url}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // [CTO UI]: Fallback Ảnh Sang Trọng
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center text-primary/30 group-hover:scale-105 transition-transform duration-500">
             <GraduationCap className="w-12 h-12 mb-2" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">EArena Course</span>
          </div>
        )}
        
        {/* Status Badge đặt góc trái */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm z-10 ${status.className}`}>
          {status.label}
        </div>

        {course.status === CourseStatus.REJECTED && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 text-center z-20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-white">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-xs font-medium">Bị từ chối. Cần chỉnh sửa lại nội dung!</p>
            </div>
          </div>
        )}
      </Link>

      {/* BOTTOM: Nội dung */}
      <div className="flex flex-col flex-1 p-5">
        
        {/* Title & Dropdown Options */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <Link href={ROUTES.TEACHER.COURSE_DETAIL(course.id)} className="flex-1 hover:text-primary transition-colors">
            <h3 className="text-base font-bold text-foreground line-clamp-2 leading-snug" title={course.title}>
              {course.title}
            </h3>
          </Link>
          
          {/* Dropdown "Ba chấm" sang trọng */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 font-medium">
              <DropdownMenuItem asChild>
                <Link href={ROUTES.TEACHER.COURSE_CURRICULUM(course.id)} className="cursor-pointer flex items-center py-2">
                  <BookOpen className="mr-2 w-4 h-4 text-primary" /> Quản lý giáo án
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={ROUTES.TEACHER.COURSE_SETTINGS(course.id)} className="cursor-pointer flex items-center py-2">
                  <Settings className="mr-2 w-4 h-4 text-muted-foreground" /> Cài đặt chung
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />

              {course.status === 'PUBLISHED' && (
                <DropdownMenuItem
                  className="cursor-pointer flex items-center py-2 text-primary"
                  onSelect={(e) => {
                    e.preventDefault();
                    setPromoteOpen(true);
                  }}
                >
                  <Megaphone className="mr-2 w-4 h-4" /> Quảng cáo (slider)
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem asChild>
                <Link href={`${ROUTES.PUBLIC.COURSE_DETAIL(course.slug)}#reviews`} target="_blank" className="cursor-pointer flex items-center py-2">
                  <MessageSquare className="mr-2 w-4 h-4 text-amber-500" /> Phản hồi đánh giá
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={ROUTES.PUBLIC.COURSE_DETAIL(course.slug)} target="_blank" className="cursor-pointer flex items-center py-2">
                  <ExternalLink className="mr-2 w-4 h-4 text-muted-foreground" /> Xem trang Public
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Khai thác Data Vàng: Student Count & Rating */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
           <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 px-2 py-1 rounded-md border border-border/50">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-foreground">{course.studentCount?.toLocaleString('vi-VN') || 0}</span> học viên
           </div>
           
           <div className="flex items-center gap-1.5 text-muted-foreground">
             <Star className={cn("w-4 h-4", course.averageRating && course.averageRating > 0 ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/50")} />
             <span className="font-bold text-foreground">
               {course.averageRating && course.averageRating > 0 ? Number(course.averageRating).toFixed(1) : 'Chưa có'}
             </span>
             {course.totalReviews && course.totalReviews > 0 ? (
               <span className="text-[11px] opacity-70">({course.totalReviews})</span>
             ) : null}
           </div>
        </div>

        {/* Footer: Giá bán & Nút Main Action trỏ vào Shell */}
        <div className="mt-auto pt-4 flex flex-col gap-4 border-t border-border">
          <div className="flex items-center justify-between">
             <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Giá bán</span>
             <strong className="text-primary text-base font-black">
               {course.price === 0 ? 'Miễn phí' : formatCurrency(course.price)}
             </strong>
          </div>
          
          <Link href={ROUTES.TEACHER.COURSE_DETAIL(course.id)} className="w-full">
            <Button variant="default" className="w-full font-bold shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              Quản lý Khóa học <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <PromoteCourseModal
          open={promoteOpen}
          onOpenChange={setPromoteOpen}
          courseId={course.id}
          courseTitle={course.title}
        />
      </div>
    </div>
  );
}

export function TeacherCourseCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      <Skeleton className="relative aspect-video w-full rounded-none" />
      <div className="flex flex-col flex-1 p-5 space-y-4">
        <div className="flex justify-between items-start gap-2">
          <Skeleton className="h-6 w-full rounded-md" />
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
        <div className="mt-auto pt-4 flex flex-col gap-4 border-t border-border">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}