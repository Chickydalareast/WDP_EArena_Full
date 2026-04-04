'use client';

import { format, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { Loader2, CheckCircle2, Clock, Timer } from 'lucide-react';
import { useTrackingMemberAttempts } from '../hooks/useTrackingExams';

interface AttemptTimelineProps {
    courseId: string;
    studentId: string;
    lessonId: string;
}

export function AttemptTimeline({ courseId, studentId, lessonId }: AttemptTimelineProps) {
    const { data, isLoading, isError } = useTrackingMemberAttempts(courseId, studentId, lessonId);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-6 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" /> Đang tải dữ liệu thi...
            </div>
        );
    }

    if (isError || !data) {
        return <div className="text-sm text-destructive py-4 text-center">Lỗi tải dữ liệu.</div>;
    }

    const attempts = data.data;

    if (attempts.length === 0) {
        return <div className="text-sm text-muted-foreground py-4 text-center">Chưa có dữ liệu làm bài chi tiết.</div>;
    }

    return (
        <div className="pl-4 border-l-2 border-border space-y-4 mt-4 mb-2 ml-2">
            {attempts.map((attempt) => {
                const isProgress = attempt.status === 'IN_PROGRESS';
                
                let durationText = '';
                if (!isProgress && attempt.submittedAt) {
                    const start = new Date(attempt.createdAt);
                    const end = new Date(attempt.submittedAt);
                    const mins = differenceInMinutes(end, start);
                    const secs = differenceInSeconds(end, start) % 60;
                    durationText = `${mins}p ${secs}s`;
                }

                return (
                    <div key={attempt._id} className="relative">
                        <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-background border-2 border-primary ring-4 ring-background" />
                        <div className="bg-muted/30 p-3 rounded-lg border border-border/50 text-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold">Lần thi: {attempt.attemptNumber}</span>
                                {isProgress ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Đang làm bài
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-500/10 text-green-600 border border-green-500/20 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Hoàn thành
                                    </span>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <div>
                                    <span className="block text-foreground/70 mb-0.5">Bắt đầu lúc</span>
                                    {format(new Date(attempt.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                                </div>
                                {!isProgress && attempt.score !== null && (
                                    <>
                                        <div>
                                            <span className="block text-foreground/70 mb-0.5">Thời gian làm</span>
                                            <span className="flex items-center gap-1 text-foreground">
                                                <Timer className="w-3 h-3" /> {durationText}
                                            </span>
                                        </div>
                                        <div className="col-span-2 pt-2 mt-1 border-t border-border/50">
                                            <span className="font-medium text-foreground">Điểm số: </span>
                                            <span className="text-primary font-bold text-sm">{attempt.score} đ</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}