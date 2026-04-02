'use client';

import React, { useState } from 'react';
import { useMyCourses } from '../hooks/useMyCourses';
import { MyCourseCard } from './MyCourseCard';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Button } from '@/shared/components/ui/button';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';
import { cn } from '@/shared/lib/utils';

export function MyCoursesList() {
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useMyCourses(page, 10);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-fr">
                
                {/* 1. BENTO HERO SKELETON (Đã tháo md:row-span-2, biến thành Wide Banner) */}
                <div className="md:col-span-2 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 rounded-[2rem] border border-border/50 p-6 bg-card items-stretch">
                    <Skeleton className="w-full md:w-5/12 aspect-video md:aspect-auto h-48 md:h-full rounded-2xl shrink-0" />
                    <div className="flex-1 flex flex-col space-y-4 py-2 w-full">
                        <Skeleton className="h-9 w-full rounded-xl" />
                        <Skeleton className="h-6 w-1/2 rounded-lg" />
                        <div className="mt-auto space-y-3 pt-6">
                          <Skeleton className="h-2.5 w-full rounded-full" />
                          <Skeleton className="h-6 w-24 rounded-md" />
                        </div>
                    </div>
                </div>

                {/* 2. STANDARD BENTO SKELETONS */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <div 
                        key={i} 
                        className="flex flex-col rounded-[2rem] border border-border/50 p-5 bg-card"
                    >
                        <Skeleton className="w-full h-48 rounded-2xl mb-4" />
                        <div className="space-y-3 shrink-0 flex-1">
                            <Skeleton className="h-7 w-full rounded-lg" />
                            <Skeleton className="h-5 w-2/3 rounded-md" />
                        </div>
                        <div className="mt-auto space-y-3 pt-4">
                          <Skeleton className="h-2.5 w-full rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-12 text-center text-destructive bg-destructive/5 rounded-3xl border border-destructive/20 font-medium">
                Không thể tải danh sách khóa học. Vui lòng thử lại sau.
            </div>
        );
    }

    const courses = data?.data || [];
    const meta = data?.meta;

    if (courses.length === 0) {
        return (
            <div className="bg-card rounded-[2.5rem] border border-border/50 p-16 text-center shadow-sm">
                <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black text-foreground mb-4 tracking-tight">Chưa có khóa học nào</h3>
                <p className="text-muted-foreground mb-10 max-w-lg mx-auto font-medium">
                    Bạn chưa ghi danh vào khóa học nào. Hãy khám phá kho tàng kiến thức trên E-Arena ngay hôm nay.
                </p>
                <Link href={ROUTES.PUBLIC.COURSES}>
                    <Button size="lg" className="font-bold h-14 px-8 rounded-full shadow-lg shadow-primary/25 hover:scale-105 transition-transform">
                        Khám phá khóa học ngay
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* BENTO GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-fr">
                {courses.map((enrollment, index) => {
                    const isHero = index === 0;
                    return (
                        <div 
                            key={enrollment.id} 
                            // [CTO FIX]: Chỉ dùng col-span-2, tuyệt đối không dùng row-span-2 để tránh kéo dãn khoảng trắng
                            className={cn(isHero && "md:col-span-2")}
                        >
                            <MyCourseCard 
                                enrollment={enrollment} 
                                isHero={isHero} 
                                className="h-full"
                            />
                        </div>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-10 border-t border-border/50">
                    <Button
                        variant="outline"
                        disabled={!meta.hasPrevPage}
                        onClick={() => {
                            setPage(p => Math.max(1, p - 1));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="font-semibold rounded-full px-6 h-12"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Trang trước
                    </Button>
                    <span className="text-sm font-bold bg-secondary px-4 py-2 rounded-full text-secondary-foreground">
                        {meta.page} / {meta.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={!meta.hasNextPage}
                        onClick={() => {
                            setPage(p => p + 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="font-semibold rounded-full px-6 h-12"
                    >
                        Trang tiếp <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            )}
        </div>
    );
}