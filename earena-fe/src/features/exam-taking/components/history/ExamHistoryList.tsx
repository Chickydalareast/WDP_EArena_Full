'use client';

import React from 'react';
import { useHistoryOverview } from '../../hooks/useExamHistory';
import { ExamHistoryCard } from './ExamHistoryCard';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Clock, BookOpenCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/config/routes';

export function ExamHistoryList() {
    const { data: overviews, isLoading, isError } = useHistoryOverview();

    if (isLoading) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="w-full h-[140px] rounded-[2rem]" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-12 text-center text-destructive bg-destructive/5 rounded-3xl border border-destructive/20 font-medium">
                Không thể tải lịch sử làm bài. Vui lòng thử lại sau.
            </div>
        );
    }

    if (!overviews || overviews.length === 0) {
        return (
            <div className="bg-card rounded-[2.5rem] border border-border/50 p-16 text-center shadow-sm">
                <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black text-foreground mb-4 tracking-tight">Chưa có lịch sử làm bài</h3>
                <p className="text-muted-foreground mb-10 max-w-lg mx-auto font-medium">
                    Bạn chưa tham gia bài kiểm tra nào. Hãy quay lại lớp học và bắt đầu bài thi đầu tiên của bạn.
                </p>
                <Link href={ROUTES.STUDENT.MY_COURSES}>
                    <Button size="lg" className="font-bold h-14 px-8 rounded-full shadow-lg shadow-primary/25 hover:scale-105 transition-transform">
                        <BookOpenCheck className="w-5 h-5 mr-2" /> Vào lớp học ngay
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {overviews.map((overview) => (
                <ExamHistoryCard key={overview.lessonId} overview={overview} />
            ))}
        </div>
    );
}