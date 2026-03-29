'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCheckoutFlow } from '@/features/billing/hooks/useBillingFlows';
import { CourseBasic } from '../types/course.schema';
import { ROUTES } from '@/config/routes';
import { formatCurrency } from '@/shared/lib/utils';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Button } from '@/shared/components/ui/button';
import { ShoppingCart, BookOpen, Loader2, MonitorPlay, Star } from 'lucide-react';

interface CourseCardProps {
  course: CourseBasic;
}

export function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();
  const { handleCheckout, isProcessing } = useCheckoutFlow();

  const finalPrice = course.discountPrice !== undefined ? course.discountPrice : course.price;
  
  const isFree = finalPrice === 0;

  const teacherInfo = course.teacher || { fullName: 'Giảng viên EArena', avatar: '' };

  const safeImageUrl = course.coverImage?.url || 'https://placehold.co/600x400/EEE/31343C?text=EArena+Course';
  const blurProps = course.coverImage?.blurHash?.startsWith('data:image')
    ? { placeholder: "blur" as const, blurDataURL: course.coverImage.blurHash } : {};

  const onPrimaryActionClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Chặn hành vi mở link mặc định của thẻ <Link> bao phủ
    e.stopPropagation(); // Không cho nổi bọt

    if (course.isEnrolled) {
      router.push(ROUTES.STUDENT.STUDY_ROOM(course.id));
      return;
    }
    handleCheckout(course);
  };

  return (
    <div className="group flex flex-col h-full bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 relative">

      {/* Lớp màng bảo vệ Link vô hình dùng cho SEO, phủ toàn bộ Card */}
      <Link
        href={ROUTES.PUBLIC.COURSE_DETAIL(course.slug)}
        className="absolute inset-0 z-10"
        aria-label={`Xem chi tiết khóa học ${course.title}`}
      />

      {isProcessing && (
        <div className="absolute inset-0 bg-background/60 z-30 flex items-center justify-center backdrop-blur-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary drop-shadow-md" />
        </div>
      )}

      {/* TOP: Ảnh bìa & Badge */}
      <div className="relative aspect-[16/10] w-full bg-muted overflow-hidden border-b border-border/50">
        <Image
          src={safeImageUrl}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          {...blurProps}
        />

        {course.subject?.name && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm z-10 uppercase tracking-wider border border-white/10 pointer-events-none">
            {course.subject.name}
          </div>
        )}

        <div className="absolute top-3 left-3 z-10 flex gap-2 pointer-events-none">
          {course.isEnrolled && (
            <div className="bg-primary/90 text-primary-foreground backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded shadow-sm uppercase tracking-wider">
              Đã Sở Hữu
            </div>
          )}
          {!course.isEnrolled && isFree && (
            <div className="bg-green-500/90 text-white backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded shadow-sm uppercase tracking-wider">
              Miễn phí
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM: Thông tin khóa học */}
      <div className="flex flex-col flex-1 p-5 pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
            {teacherInfo.avatar ? (
              <Image src={teacherInfo.avatar} alt={teacherInfo.fullName} width={24} height={24} className="object-cover w-full h-full" />
            ) : (
              <span className="text-[10px] font-bold text-primary">{teacherInfo.fullName.charAt(0)}</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground font-semibold truncate transition-colors">
            {teacherInfo.fullName}
          </span>
        </div>

        {/* --- BỔ SUNG HIỂN THỊ RATING VÀO ĐÂY --- */}
        <div className="flex items-center gap-1.5 mb-2">
          {course.averageRating && course.averageRating > 0 ? (
            <>
              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
              <span className="text-xs font-bold text-yellow-600 dark:text-yellow-500">
                {Number(course.averageRating).toFixed(1)}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                ({course.totalReviews} đánh giá)
              </span>
            </>
          ) : (
             <span className="text-[11px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
               Chưa có đánh giá
             </span>
          )}
        </div>

        <h3 className="text-base font-extrabold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
          {course.title}
        </h3>

        <div className="flex-1" />

        <div className="flex items-end justify-between mt-4 pt-4 border-t border-border/60 pointer-events-auto relative z-20">

          <div className="flex flex-col">
            {!course.isEnrolled && course.discountPrice !== undefined && course.discountPrice > 0 && course.discountPrice < course.price && (
              <span className="text-xs text-muted-foreground line-through decoration-red-500/50 font-medium">
                {formatCurrency(course.price)}
              </span>
            )}

            {course.isEnrolled ? (
              <span className="text-sm font-bold text-primary">Tiếp tục học</span>
            ) : (
              <span className="text-lg font-extrabold text-primary tracking-tight">
                {isFree ? 'Miễn phí' : formatCurrency(finalPrice)}
              </span>
            )}
          </div>

          <Button
            size="sm"
            onClick={onPrimaryActionClick}
            disabled={isProcessing}
            className={`rounded-full px-4 font-bold shadow-md transition-all ${course.isEnrolled ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : course.isEnrolled ? (
              <>Vào lớp <MonitorPlay className="ml-1.5 w-4 h-4" /></>
            ) : isFree ? (
              <>Học ngay <BookOpen className="ml-1.5 w-4 h-4" /></>
            ) : (
              <>Mua ngay <ShoppingCart className="ml-1.5 w-4 h-4" /></>
            )}
          </Button>

        </div>
      </div>
    </div>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      <Skeleton className="relative aspect-[16/10] w-full rounded-none" />
      <div className="flex flex-col flex-1 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-3 w-24 rounded-full" />
        </div>
        <Skeleton className="h-5 w-full rounded-md" />
        <Skeleton className="h-5 w-2/3 rounded-md" />
        <div className="flex-1" />
        <div className="flex items-end justify-between mt-4 pt-4 border-t border-border/60">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}