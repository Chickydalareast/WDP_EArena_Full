'use client';

import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { courseQueryKeys } from '../api/course-keys';
import { courseService } from '../api/course.service';
import { ROUTES } from '@/config/routes';
import { formatCurrency } from '@/shared/lib/utils';
import { ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { CourseBasic } from '../types/course.schema';

export function CourseFeaturedCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: courseQueryKeys.featuredCarousel(),
    queryFn: () => courseService.getFeaturedCarousel(),
    staleTime: 1000 * 60 * 2,
  });

  const items = (data?.items ?? []) as CourseBasic[];

  const scroll = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 360, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="mb-8 flex h-40 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || items.length === 0) return null;

  return (
    <section className="mb-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Khóa học nổi bật
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gói Enterprise & khóa đang chạy quảng cáo có phí
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => scroll(-1)}
            aria-label="Trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => scroll(1)}
            aria-label="Sau"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((course) => {
          const img =
            course.coverImage?.url ||
            'https://placehold.co/640x360/e2e8f0/64748b?text=Course';
          const price =
            course.discountPrice !== undefined && course.discountPrice > 0
              ? course.discountPrice
              : course.price;
          return (
            <Link
              key={course.id}
              href={ROUTES.PUBLIC.COURSE_DETAIL(course.slug)}
              className="snap-start shrink-0 w-[min(100%,300px)] flex flex-col rounded-xl border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition overflow-hidden"
            >
              <div className="relative aspect-video w-full bg-muted">
                <Image
                  src={img}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="300px"
                  unoptimized={img.includes('placehold.co')}
                />
              </div>
              <div className="p-3 space-y-1">
                <p className="font-semibold line-clamp-2 text-sm">{course.title}</p>
                <p className="text-sm text-primary font-bold">
                  {price === 0 ? 'Miễn phí' : formatCurrency(price)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {course.teacher?.fullName || 'Giảng viên'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
