'use client';

import React from 'react';
import { BrainCircuit, AlertCircle, CheckCircle2, LayoutTemplate } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useDynamicPreview } from '../../hooks/useDynamicPreview';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { DynamicPreviewRequestDTO } from '@/features/exam-builder/types/exam.schema';

export function DynamicQuizPreviewer() {
    const { control } = useFormContext<any>();
    
    // Lấy toàn bộ cấu hình AdHoc
    const adHocSections = useWatch({ control, name: 'dynamicConfig.adHocSections' }) || [];
    
    // Tính tổng số câu yêu cầu (limit)
    const totalRequired = adHocSections.reduce((acc: number, section: any) => {
        const sectionTotal = (section.rules || []).reduce((sum: number, r: any) => sum + (Number(r.limit) || 0), 0);
        return acc + sectionTotal;
    }, 0);

    const rawPayload: DynamicPreviewRequestDTO = { adHocSections };
    const debouncedPayload = useDebounce(rawPayload, 800); // 800ms để tránh giật lag UI khi gõ liên tục

    const { data: rawPreviewResponse, isFetching, isError, error } = useDynamicPreview(
        totalRequired > 0 ? debouncedPayload : null
    );

    // [CTO FIX]: Lấy đúng data bị bóc vỏ bởi Axios Client
    const actualPreviewData = (rawPreviewResponse as any)?.data || rawPreviewResponse;
    const actualQuestions = actualPreviewData?.totalActualQuestions || 0;
    const questionsList = actualPreviewData?.previewData?.questions || [];
    
    const isHealthy = actualQuestions >= totalRequired;

    if (totalRequired === 0) {
        return (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-slate-400">
                <LayoutTemplate className="w-12 h-12 mb-3 opacity-50" />
                <p className="font-medium text-sm">Vui lòng thiết lập luật bốc đề để xem trước kết quả.</p>
            </div>
        );
    }

    return (
        <div className="bg-card border shadow-sm rounded-xl overflow-hidden flex flex-col h-full animate-in fade-in duration-300">
            {/* THANH MÁU (BANK HEALTH BAR) */}
            <div className={cn(
                "p-4 border-b flex items-center justify-between transition-colors",
                isError ? "bg-destructive/10 border-destructive/20" : isHealthy ? "bg-green-50 dark:bg-green-950/20 border-green-200" : "bg-amber-50 dark:bg-amber-950/20 border-amber-200"
            )}>
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-full", isError ? "bg-destructive/20 text-destructive" : isHealthy ? "bg-green-200 text-green-700" : "bg-amber-200 text-amber-700")}>
                        <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-foreground">Sức khỏe Ngân hàng</h4>
                        {/* [CTO FIX]: Đổi thẻ <p> thành <div> để tránh lỗi Hydration (p không được chứa div) */}
                        <div className="text-xs font-medium text-muted-foreground flex items-center gap-1 mt-0.5">
                            Yêu cầu: <span className="text-foreground font-bold">{totalRequired}</span> | 
                            Khả dụng: 
                            {isFetching ? <Skeleton className="w-8 h-3 inline-block ml-1" /> : (
                                <span className={cn("font-bold ml-1", isHealthy ? "text-green-600" : "text-amber-600")}>{actualQuestions}</span>
                            )}
                        </div>
                    </div>
                </div>

                {isError ? (
                    <div className="text-xs font-bold text-destructive flex items-center bg-destructive/10 px-2.5 py-1 rounded-md">
                        <AlertCircle className="w-4 h-4 mr-1.5" /> Lỗi cấu hình
                    </div>
                ) : isHealthy ? (
                    <div className="text-xs font-bold text-green-700 flex items-center bg-green-100 px-2.5 py-1 rounded-md">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Đủ dữ liệu
                    </div>
                ) : (
                    <div className="text-xs font-bold text-amber-700 flex items-center bg-amber-100 px-2.5 py-1 rounded-md">
                        <AlertCircle className="w-4 h-4 mr-1.5" /> Thiếu câu hỏi
                    </div>
                )}
            </div>

            {/* ERROR MESSAGE TỪ BACKEND */}
            {isError && (
                <div className="p-4 bg-destructive/5 text-destructive text-sm font-medium">
                    {(error as any)?.response?.data?.message || "Kho câu hỏi không đủ đáp ứng tiêu chí. Vui lòng nới lỏng điều kiện."}
                </div>
            )}

            {/* KHU VỰC LIVE PREVIEW (CHỈ RENDER MẪU 3 CÂU) */}
            <div className="p-4 flex-1 overflow-y-auto bg-slate-50/50 space-y-4">
                <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Bản nháp sinh thử (#001)</h5>
                
                {isFetching ? (
                    Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="w-full h-32 rounded-xl" />
                    ))
                ) : questionsList.length > 0 ? ( // [CTO FIX]: Dùng biến questionsList đã trích xuất an toàn
                    questionsList.slice(0, 3).map((q: any, idx: number) => (
                        <div key={idx} className="bg-background p-4 rounded-xl border border-border shadow-sm text-sm">
                            <span className="font-bold text-primary mr-2">Câu {idx + 1}:</span>
                            <span className="font-medium text-foreground">{q.content}</span>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                {q.answers?.map((ans: any) => (
                                    <div key={ans.id} className="p-2 bg-muted/30 rounded-lg border border-border text-xs text-muted-foreground truncate">
                                        <span className="font-bold mr-1">{ans.id}.</span> {ans.content}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : null}
                
                {!isFetching && actualQuestions > 3 && (
                    <div className="text-center text-xs font-bold text-muted-foreground bg-muted/20 py-2 rounded-lg border border-border border-dashed">
                        + {actualQuestions - 3} câu hỏi khác...
                    </div>
                )}
            </div>
        </div>
    );
}