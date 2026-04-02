'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ExamHistoryOverview, ExamAttemptDetail } from '../../types/exam-history.schema';
import { useLessonAttempts } from '../../hooks/useExamHistory';
import { ChevronDown, ChevronUp, BookOpen, Clock, CheckCircle2, PlayCircle, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ROUTES } from '@/config/routes';
import { cn } from '@/shared/lib/utils';

export function ExamHistoryCard({ overview }: { overview: ExamHistoryOverview }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // [Lazy Load]: Chỉ fetch chi tiết attempts khi Accordion mở
    const { data: attempts, isLoading, isError } = useLessonAttempts(overview.lessonId, isExpanded);

    const isPassed = overview.bestScore !== null && overview.passPercentage !== null
        ? (overview.bestScore! / 10) * 100 >= overview.passPercentage!
        : false;

    return (
        <div className={cn(
            "bg-card rounded-[2rem] border transition-all duration-300 overflow-hidden",
            isExpanded ? "border-primary shadow-lg shadow-primary/10" : "border-border/60 hover:border-primary/40 shadow-sm"
        )}>
            {/* TIER 1: OVERVIEW HEADER (Luôn hiển thị) */}
            <div
                className="p-6 md:p-8 cursor-pointer select-none flex flex-col md:flex-row gap-6 justify-between md:items-center"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                        <BookOpen className="w-4 h-4 text-primary" />
                        {overview.courseTitle}
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-foreground">{overview.lessonTitle}</h3>

                    <div className="flex flex-wrap gap-4 mt-4 text-sm font-medium">
                        <div className="bg-secondary px-3 py-1.5 rounded-lg flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>Đã thử: <strong className="text-foreground">{overview.attemptsUsed}</strong> / {overview.maxAttempts || '∞'}</span>
                        </div>
                        {overview.isLatestInProgress && (
                            <div className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5">
                                <PlayCircle className="w-4 h-4" /> Đang làm dở
                            </div>
                        )}
                    </div>
                </div>

                {/* Score Stats */}
                <div className="flex items-center gap-6 shrink-0 border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-8">
                    <div className="text-center">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Điểm cao nhất</p>
                        <div className="text-3xl font-black text-foreground flex items-baseline gap-1">
                            {overview.bestScore !== null && overview.bestScore !== undefined ? (
                                <span className={isPassed ? "text-green-600 dark:text-green-500" : "text-primary"}>{overview.bestScore.toFixed(1)}</span>
                            ) : (
                                <span className="text-muted-foreground">-</span>
                            )}
                            <span className="text-lg text-muted-foreground">/10</span>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground transition-transform">
                        {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                    </div>
                </div>
            </div>

            {/* TIER 2: ATTEMPTS LIST (Accordion Body) */}
            <div className={cn(
                "grid transition-all duration-300 ease-in-out",
                isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}>
                <div className="overflow-hidden">
                    <div className="p-6 md:p-8 bg-secondary/30 border-t border-border/50 space-y-4">
                        <h4 className="font-bold text-foreground mb-4">Chi tiết các lần làm bài</h4>

                        {isLoading && (
                            <div className="space-y-3">
                                <Skeleton className="w-full h-16 rounded-xl" />
                                <Skeleton className="w-full h-16 rounded-xl" />
                            </div>
                        )}

                        {isError && (
                            <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-bold flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" /> Không thể tải chi tiết lần thi.
                            </div>
                        )}

                        {attempts && attempts.length > 0 && (
                            <div className="space-y-3">
                                {attempts.map((attempt, idx) => (
                                    <AttemptDetailRow
                                        key={attempt._id}
                                        attempt={attempt}
                                        index={attempts.length - idx}
                                        courseId={overview.courseId}
                                        lessonId={overview.lessonId}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Bạn giữ nguyên code phần trên của file ExamHistoryCard.tsx
// Chỉ thay thế toàn bộ function AttemptDetailRow ở cuối file bằng đoạn code này:

// Render từng dòng chi tiết (Attempt Tier 2)
function AttemptDetailRow({ attempt, index, courseId, lessonId }: { attempt: ExamAttemptDetail, index: number, courseId: string, lessonId: string }) {
    const isCompleted = attempt.status === 'COMPLETED';
    
    // An toàn Nullable cho thời gian làm bài
    const formatTime = (seconds?: number | null) => {
        if (!seconds) return '--:--';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}p ${s}s`;
    };

    // [CTO FIX]: An toàn tuyệt đối cho việc Parse ngày tháng từ Backend
    const formatDateTimeSafe = (dateStr?: string | null) => {
        if (!dateStr) return '--/--/----';
        const date = new Date(dateStr);
        // Bắt lỗi "Invalid Date" của JavaScript
        if (isNaN(date.getTime())) return '--/--/----'; 
        return format(date, 'HH:mm dd/MM/yyyy');
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-card border border-border/60 rounded-xl hover:border-primary/30 transition-colors gap-4">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center shrink-0">
                    #{index}
                </div>
                <div>
                    <div className="font-bold text-foreground">
                        {isCompleted 
                            // Bọc thêm fallback ?? '-' phòng trường hợp BE trả về null dù đã COMPLETED
                            ? `Điểm số: ${attempt.score?.toFixed(1) ?? '-'} / 10` 
                            : 'Trạng thái: Đang làm bài'
                        }
                    </div>
                    <div className="text-xs font-medium text-muted-foreground mt-1 space-x-3">
                        {/* Gọi hàm Safe Format thay vì format trực tiếp */}
                        <span>Bắt đầu: {formatDateTimeSafe(attempt.startedAt)}</span>
                        {isCompleted && <span>• Thời gian: {formatTime(attempt.timeSpent)}</span>}
                    </div>
                </div>
            </div>

            <div className="w-full sm:w-auto shrink-0">
                {isCompleted ? (
                    <Link href={ROUTES.STUDENT.EXAM_RESULT(attempt._id)}>
                        <Button variant="outline" className="w-full font-bold">
                            Xem kết quả
                        </Button>
                    </Link>
                ) : (
                    <Link href={ROUTES.STUDENT.STUDY_ROOM(courseId, lessonId)}>
                        <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold">
                            Tiếp tục thi <PlayCircle className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}