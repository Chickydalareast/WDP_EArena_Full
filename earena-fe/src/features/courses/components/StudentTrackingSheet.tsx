'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/shared/components/ui/sheet';
import { useTrackingMemberExams } from '../hooks/useTrackingExams';
import { AttemptTimeline } from './AttemptTimeline';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, AlertTriangle, BookOpenCheck, BarChart3, Clock3 } from 'lucide-react';

interface StudentTrackingSheetProps {
    courseId: string;
    student: { id: string; name: string } | null;
    onClose: () => void;
}

export function StudentTrackingSheet({ courseId, student, onClose }: StudentTrackingSheetProps) {
    const { data, isLoading, isError } = useTrackingMemberExams(courseId, student?.id || null);

    const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

    const toggleExpand = (lessonId: string) => {
        setExpandedLessonId(prev => prev === lessonId ? null : lessonId);
    };

    const exams = data?.data || [];

    return (
        <Sheet open={!!student} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-2xl md:max-w-4xl overflow-y-auto custom-scrollbar p-0 bg-background">

                <SheetHeader className="p-6 border-b border-border sticky top-0 bg-background z-10">
                    <SheetTitle className="text-xl flex items-center gap-2">
                        <BookOpenCheck className="w-5 h-5 text-primary" />
                        Báo cáo Học tập Chi tiết
                    </SheetTitle>
                    <SheetDescription>
                        Lịch sử thi và phân tích tiến độ của học viên trong khóa học.
                    </SheetDescription>
                </SheetHeader>

                <div className="p-4 sm:p-6 md:p-8 space-y-6">
                    <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex flex-col">
                            <h3 className="text-2xl font-bold tracking-tight">{student?.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">Học viên khóa học</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm font-medium">
                                <BarChart3 className="w-4 h-4 text-primary" />
                                Bài thi: <span className="font-bold">{exams.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border rounded-xl p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5 px-1">
                            <h3 className="text-lg font-semibold tracking-tight">Chi tiết Lịch sử thi</h3>
                            <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                                {exams.length} bài thi
                            </span>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} className="h-28 w-full rounded-xl" />)
                            ) : isError ? (
                                <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm text-center">
                                    Không thể tải dữ liệu. Vui lòng thử lại.
                                </div>
                            ) : exams.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                                    <AlertTriangle className="w-8 h-8 mb-2 opacity-50 text-primary" />
                                    <p>Học viên chưa thực hiện bất kỳ bài kiểm tra nào trong khóa này.</p>
                                </div>
                            ) : (
                                exams.map((exam) => {
                                    const isOutOfAttempts = exam.maxAttempts > 0 && exam.attemptsUsed >= exam.maxAttempts;
                                    const isExpanded = expandedLessonId === exam.lessonId;

                                    return (
                                        <div key={exam.lessonId} className={`border rounded-xl transition-all duration-300 ${isOutOfAttempts ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card hover:border-primary/30'}`}>

                                            <div
                                                className="p-5 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
                                                onClick={() => toggleExpand(exam.lessonId)}
                                            >
                                                <div className="flex-1 w-full">
                                                    <h4 className="font-semibold text-base leading-tight text-foreground group-hover:text-primary transition-colors">{exam.lessonTitle}</h4>

                                                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                                                        <div className="bg-secondary/80 px-3 py-1.5 rounded-lg border border-border/50">
                                                            <span className="text-muted-foreground text-xs block mb-0.5">Điểm cao nhất</span>
                                                            <span className="font-bold text-foreground">{exam.bestScore} đ</span>
                                                        </div>
                                                        <div className={`px-3 py-1.5 rounded-lg border ${isOutOfAttempts ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-secondary/80 border-border/50 text-foreground'}`}>
                                                            <span className="text-opacity-80 text-xs block mb-0.5">Lượt thi</span>
                                                            <span className="font-bold">{exam.attemptsUsed} {exam.maxAttempts > 0 ? `/ ${exam.maxAttempts}` : 'lần'}</span>
                                                        </div>
                                                        <div className="hidden sm:block px-3 py-1.5 flex items-center gap-2">
                                                            <Clock3 className="w-4 h-4 text-muted-foreground opacity-60" />
                                                            <div>
                                                                <span className="text-muted-foreground text-xs block mb-0.5">Nộp lần cuối</span>
                                                                <span className="font-medium text-foreground">{format(new Date(exam.latestSubmittedAt), 'dd/MM/yyyy HH:mm')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-full sm:w-auto flex justify-center sm:justify-end border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0 mt-2 sm:mt-0">
                                                    <div className={`p-1.5 rounded-full transition-colors ${isExpanded ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                                    </div>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="px-5 pb-5 animate-in slide-in-from-top-2 fade-in duration-300">
                                                    <AttemptTimeline
                                                        courseId={courseId}
                                                        studentId={student!.id}
                                                        lessonId={exam.lessonId}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}