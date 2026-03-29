'use client';

import React, { useState } from 'react';
import { useMyCourses } from '../hooks/useMyCourses';
import { MyCourseCard } from './MyCourseCard';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Button } from '@/shared/components/ui/button';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';

export function MyCoursesList() {
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useMyCourses(page, 9); // Lấy 9 khóa/trang cho đẹp grid 3 cột

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-4 rounded-2xl border p-4">
                        <Skeleton className="w-full aspect-video rounded-xl" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-2 w-full mt-4" />
                    </div>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-12 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
                <p className="font-bold text-lg">Không thể tải danh sách khóa học.</p>
                <p className="text-sm mt-2">Vui lòng thử lại sau.</p>
            </div>
        );
    }

    const courses = data?.data || [];
    const meta = data?.meta;

    if (courses.length === 0) {
        return (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3">Chưa có khóa học nào</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                    Bạn chưa ghi danh vào khóa học nào. Hãy khám phá hàng trăm khóa học chất lượng trên hệ thống nhé.
                </p>
                <Link href={ROUTES.PUBLIC.COURSES}>
                    <Button size="lg" className="font-bold bg-blue-600 hover:bg-blue-700 shadow-md">
                        Khám phá khóa học ngay
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((enrollment) => (
                    <MyCourseCard key={enrollment.id} enrollment={enrollment} />
                ))}
            </div>

            {/* Pagination Controls */}
            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-8 border-t border-slate-200">
                    <Button
                        variant="outline"
                        disabled={!meta.hasPrevPage}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="font-semibold text-slate-600"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Trang trước
                    </Button>
                    <span className="text-sm font-bold text-slate-700">
                        Trang {meta.page} / {meta.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={!meta.hasNextPage}
                        onClick={() => setPage(p => p + 1)}
                        className="font-semibold text-slate-600"
                    >
                        Trang tiếp <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            )}
        </div>
    );
}