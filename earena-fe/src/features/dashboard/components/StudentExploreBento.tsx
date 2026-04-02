'use client';

import React from 'react';
import { usePublicCourses } from '@/features/courses/hooks/useCourses';
import { CourseCard, CourseCardSkeleton } from '@/features/courses/components/CourseCard';

export function StudentExploreBento() {
    // Lấy 4 khóa học public mới/nổi bật nhất
    const { data, isLoading, isError } = usePublicCourses({ limit: 4 });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <CourseCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    const items = data?.items || [];

    if (isError || items.length === 0) {
        return (
            <div className="p-8 text-center bg-card rounded-2xl border border-border/50 text-muted-foreground text-sm font-medium">
                Hiện tại chưa có khóa học mới nào.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map(course => (
                <CourseCard key={course.id} course={course} />
            ))}
        </div>
    );
}