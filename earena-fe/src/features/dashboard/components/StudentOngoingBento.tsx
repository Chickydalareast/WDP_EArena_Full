'use client';

import React from 'react';
import { useMyCourses } from '@/features/courses/hooks/useMyCourses';
import { MyCourseCard } from '@/features/courses/components/MyCourseCard';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';

export function StudentOngoingBento() {
    // Fetch top 4 khóa học gần nhất
    const { data, isLoading, isError } = useMyCourses(1, 4);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-fr">
                {/* Skeleton Hero (Bên trái) */}
                <div className="md:col-span-12 lg:col-span-6 bg-card rounded-[2rem] border border-border p-6 flex flex-col md:flex-row gap-6">
                    <Skeleton className="w-full md:w-1/2 aspect-video rounded-xl" />
                    <div className="flex-1 space-y-4 py-4">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-10 w-full mt-auto" />
                    </div>
                </div>
                {/* Skeleton 2 Cards nhỏ (Bên phải) */}
                <div className="md:col-span-12 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Skeleton className="w-full h-full min-h-[250px] rounded-[2rem]" />
                    <Skeleton className="w-full h-full min-h-[250px] rounded-[2rem]" />
                </div>
            </div>
        );
    }

    const courses = data?.data || [];

    if (isError || courses.length === 0) {
        return (
            <div className="bg-card border border-dashed border-border/60 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                    <BookOpen size={32} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Chưa có khóa học nào</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-6">
                    Bạn chưa ghi danh vào khóa học nào. Hãy khám phá ngay nhé.
                </p>
                <Link
                    href={ROUTES.PUBLIC.COURSES}
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-primary/90 transition-colors"
                >
                    Khám phá ngay
                </Link>
            </div>
        );
    }

    // Tách khóa đầu tiên làm Hero, các khóa còn lại làm Grid
    const heroCourse = courses[0];
    const recentCourses = courses.slice(1, 3); // Lấy tối đa 2 khóa tiếp theo cho vừa Grid

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* HERO: Resume Learning (Chiếm 6 cột lg) */}
            <div className="md:col-span-12 lg:col-span-6 flex">
                <MyCourseCard
                    enrollment={heroCourse}
                    isHero={true}
                    className="w-full h-full"
                />
            </div>

            {/* RECENT: 2 Khóa học tiếp theo (Chiếm 6 cột lg) */}
            {recentCourses.length > 0 && (
                <div className="md:col-span-12 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {recentCourses.map(course => (
                        <MyCourseCard
                            key={course.id}
                            enrollment={course}
                            isHero={false}
                            className="w-full h-full"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}