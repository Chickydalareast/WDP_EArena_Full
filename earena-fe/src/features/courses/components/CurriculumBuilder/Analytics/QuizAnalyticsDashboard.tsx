'use client';

import React, { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useQuizStats, useQuizAttempts } from '../../../hooks/useQuizAnalytics';
import { QuizStatsCharts } from './QuizStatsCharts';
import { QuizAttemptsTable } from './QuizAttemptsTable';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface QuizAnalyticsDashboardProps {
    courseId: string;
    lessonId: string;
}

export function QuizAnalyticsDashboard({ courseId, lessonId }: QuizAnalyticsDashboardProps) {
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: statsData, isFetching: isFetchingStats, isError: isErrorStats } = useQuizStats(courseId, lessonId);
    const { data: attemptsData, isFetching: isFetchingAttempts } = useQuizAttempts(courseId, lessonId, page, limit);

    if (isErrorStats) {
        return (
            <div className="p-6 bg-red-50 text-red-600 rounded-xl flex items-center border border-red-200">
                <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                <p className="text-sm font-medium">Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 py-2">
            <section>
                {isFetchingStats && !statsData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-[250px] w-full rounded-xl" />
                        <Skeleton className="h-[250px] w-full rounded-xl" />
                    </div>
                ) : (
                    statsData && <QuizStatsCharts data={statsData} />
                )}
            </section>

            <section className="space-y-3">
                <h3 className="font-bold text-lg text-foreground flex items-center">
                    Lịch sử làm bài của Học viên
                    {isFetchingAttempts && <Loader2 className="w-4 h-4 ml-3 animate-spin text-primary" />}
                </h3>
                <QuizAttemptsTable
                    data={attemptsData?.items || []}
                    meta={attemptsData?.meta || { totalItems: 0, currentPage: 1, totalPages: 1, itemCount: 0, itemsPerPage: limit }}
                    isFetching={isFetchingAttempts}
                    onPageChange={setPage}
                />
            </section>
        </div>
    );
}