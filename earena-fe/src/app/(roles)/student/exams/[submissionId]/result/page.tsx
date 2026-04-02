'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useExamReview } from '@/features/exam-taking/hooks/useTakeExam';
import { ROUTES } from '@/config/routes';
import { Loader2, ArrowLeft, CheckCircle2, XCircle, AlertCircle, Trophy, Target, FileQuestion } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface ExamDetailItem {
    questionId: string;
    isCorrect: boolean;
    content: string;
    studentAnswer?: any; 
    correctAnswer?: any;
}

export default function ExamResultPage({ params }: { params: Promise<{ submissionId: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);

    const { data, isLoading, isError } = useExamReview(resolvedParams.submissionId);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in fade-in duration-500">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <h2 className="text-2xl font-black text-foreground">Đang tải kết quả thi...</h2>
                <p className="text-muted-foreground font-medium mt-2">Vui lòng chờ trong giây lát</p>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in-95">
                <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10 text-destructive" />
                </div>
                <h2 className="text-2xl font-black text-foreground mb-2">Không tìm thấy kết quả</h2>
                <p className="text-muted-foreground font-medium max-w-md mx-auto mb-8">
                    Phiên làm bài này có thể không tồn tại hoặc bạn không có quyền truy cập.
                </p>
                <Button onClick={() => router.push(ROUTES.STUDENT.MY_COURSES)} className="font-bold h-12 px-8 rounded-xl shadow-md">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại lớp học
                </Button>
            </div>
        );
    }

    const summary = data.summary;
    const rawScore = summary?.score ?? 0;
    const rawCorrect = summary?.correctCount ?? 0;
    const rawTotal = summary?.totalQuestions ?? 1;
    const rawIncorrect = summary?.incorrectCount ?? 0;

    const safeTotal = Math.max(rawTotal, 1);
    const safeCorrect = Math.min(rawCorrect, safeTotal);
    const safeIncorrect = Math.min(rawIncorrect, safeTotal - safeCorrect);
    const safeScore = Math.min(rawScore, 10); 

    const isPassed = (safeScore / 10) * 100 >= 50;
    const details = (data.details as ExamDetailItem[]) || [];

    const formatAnswerSafe = (ans: any): string => {
        if (!ans) return '';
        if (Array.isArray(ans)) {
            return ans.map(a => {
                if (typeof a === 'object') return a.content || a.id || '';
                return String(a);
            }).filter(Boolean).join(', ');
        }
        if (typeof ans === 'object') return ans.content || ans.id || '';
        return String(ans);
    };

    return (
        <div className="max-w-[1000px] w-full mx-auto space-y-8 pb-20 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            {/* 1. HEADER */}
            <div className="flex items-center gap-4 border-b border-border/60 pb-6 mt-8">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => router.back()}
                    className="w-12 h-12 rounded-full hover:bg-secondary shrink-0"
                >
                    <ArrowLeft className="w-6 h-6 text-foreground" />
                </Button>
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                        Báo Cáo Kết Quả
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1 text-sm md:text-base">
                        Phân tích chi tiết và đáp án bài kiểm tra của bạn.
                    </p>
                </div>
            </div>

            {/* 2. BENTO SUMMARY CARD */}
            {/* [CTO FIX]: Chuyển md:grid-cols-12 thành lg:grid-cols-12 để màn hình tablet được full width */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className={cn(
                    "lg:col-span-5 rounded-[2rem] p-6 lg:p-8 flex flex-col items-center justify-center text-center shadow-sm border",
                    isPassed ? "bg-green-500/10 border-green-500/20" : "bg-destructive/10 border-destructive/20"
                )}>
                    <div className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-inner",
                        isPassed ? "bg-green-500 text-white" : "bg-destructive text-white"
                    )}>
                        {isPassed ? <Trophy className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                    </div>
                    <p className={cn("text-sm font-bold uppercase tracking-widest mb-1", isPassed ? "text-green-700 dark:text-green-400" : "text-destructive")}>
                        {isPassed ? 'Đạt Yêu Cầu' : 'Chưa Đạt'}
                    </p>
                    <div className="flex items-baseline gap-1">
                        <span className={cn("text-6xl font-black tracking-tight drop-shadow-sm", isPassed ? "text-green-600 dark:text-green-500" : "text-destructive")}>
                            {safeScore.toFixed(1)}
                        </span>
                        <span className="text-2xl font-bold text-muted-foreground">/ 10</span>
                    </div>
                </div>

                <div className="lg:col-span-7 bg-card rounded-[2rem] border border-border p-6 lg:p-8 shadow-sm flex flex-col justify-center">
                    <h3 className="font-bold text-foreground flex items-center gap-2 mb-6 text-lg">
                        <Target className="w-5 h-5 text-primary" /> Thống kê chi tiết
                    </h3>
                    {/* [CTO FIX]: Chuyển thành grid-cols-1 sm:grid-cols-3 để tự xuống dòng trên màn hình quá bé */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-secondary/50 rounded-2xl p-4 border border-border/50 text-center flex flex-col items-center justify-center">
                            <FileQuestion className="w-6 h-6 text-muted-foreground mb-2 shrink-0" />
                            <div className="text-2xl font-black text-foreground">{safeTotal}</div>
                            <p className="text-[11px] sm:text-xs font-bold text-muted-foreground mt-1 uppercase tracking-wide">Tổng câu</p>
                        </div>
                        <div className="bg-green-500/10 rounded-2xl p-4 border border-green-500/20 text-center flex flex-col items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-500 mb-2 shrink-0" />
                            <div className="text-2xl font-black text-green-600 dark:text-green-500">{safeCorrect}</div>
                            <p className="text-[11px] sm:text-xs font-bold text-green-700 dark:text-green-400 mt-1 uppercase tracking-wide">Trả lời đúng</p>
                        </div>
                        <div className="bg-destructive/10 rounded-2xl p-4 border border-destructive/20 text-center flex flex-col items-center justify-center">
                            <XCircle className="w-6 h-6 text-destructive mb-2 shrink-0" />
                            <div className="text-2xl font-black text-destructive">{safeIncorrect}</div>
                            <p className="text-[11px] sm:text-xs font-bold text-destructive mt-1 uppercase tracking-wide">Sai / Bỏ qua</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. ĐÁP ÁN CHI TIẾT */}
            {details && details.length > 0 && (
                <div className="space-y-6 pt-4">
                    <h3 className="text-2xl font-black text-foreground flex items-center gap-2 tracking-tight">
                        <FileQuestion className="w-7 h-7 text-primary" />
                        Chữa bài chi tiết
                    </h3>

                    <div className="space-y-6">
                        {details.map((item, index) => {
                            const isCorrect = item.isCorrect;
                            const displayStudentAnswer = formatAnswerSafe(item.studentAnswer) || 'Chưa trả lời';
                            const displayCorrectAnswer = formatAnswerSafe(item.correctAnswer) || 'Không có đáp án';

                            return (
                                <div 
                                    key={item.questionId || index} 
                                    className={cn(
                                        "bg-card rounded-3xl border p-5 md:p-8 shadow-sm transition-all hover:shadow-md",
                                        isCorrect ? "border-green-500/30 hover:border-green-500/60" : "border-destructive/30 hover:border-destructive/60"
                                    )}
                                >
                                    <div className="flex items-start gap-4 w-full">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner mt-1",
                                            isCorrect ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400" : "bg-destructive/10 text-destructive"
                                        )}>
                                            {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="font-black text-lg text-foreground">Câu {index + 1}</span>
                                                <span className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                    isCorrect ? "bg-green-500 text-white" : "bg-destructive text-white"
                                                )}>
                                                    {isCorrect ? 'Chính xác' : 'Sai'}
                                                </span>
                                            </div>
                                            
                                            <div 
                                                className="prose prose-slate dark:prose-invert max-w-none text-foreground font-medium mb-6 leading-relaxed break-words overflow-hidden"
                                                dangerouslySetInnerHTML={{ __html: item.content || 'Nội dung câu hỏi...' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Hộp so sánh đáp án */}
                                    <div className="ml-0 md:ml-14 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:p-5 rounded-2xl bg-secondary/50 border border-border/50">
                                        <div className="flex flex-col gap-1.5 min-w-0">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Đáp án bạn chọn</span>
                                            <span className={cn(
                                                "font-black text-lg break-words",
                                                isCorrect ? "text-green-600 dark:text-green-500" : "text-destructive"
                                            )}>
                                                {displayStudentAnswer}
                                            </span>
                                        </div>

                                        {!isCorrect && (
                                            <div className="flex flex-col gap-1.5 sm:border-l sm:border-border/60 sm:pl-5 min-w-0">
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Đáp án đúng</span>
                                                <span className="font-black text-lg text-green-600 dark:text-green-500 break-words">
                                                    {displayCorrectAnswer}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}