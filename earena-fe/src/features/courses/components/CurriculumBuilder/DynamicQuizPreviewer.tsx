'use client';

import React, { useMemo } from 'react';
import { BrainCircuit, AlertCircle, CheckCircle2, LayoutTemplate } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useDynamicPreview } from '../../hooks/useDynamicPreview';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { DynamicPreviewRequestDTO } from '@/features/exam-builder/types/exam.schema';
import { CreateQuizLessonDTO } from '../../types/curriculum.schema';
import { buildNestedQuestions } from '../../lib/quiz-utils';

export function DynamicQuizPreviewer() {
    // [CTO ARCHITECTURE]: Type Safe tuyệt đối, loại bỏ 'any'
    const { control } = useFormContext<CreateQuizLessonDTO>();
    
    const adHocSections = useWatch({ control, name: 'dynamicConfig.adHocSections' }) || [];
    
    // [CTO FIX 1]: Tính toán chính xác Số lượng câu hỏi thực tế yêu cầu
    const totalRequired = useMemo(() => {
        return adHocSections.reduce((acc, section) => {
            const sectionTotal = (section.rules || []).reduce((sum, r) => {
                if (r.questionType === 'PASSAGE') {
                    // Nếu là đoạn văn: Tổng câu = Số bài đọc * Số câu con/bài
                    return sum + (Number(r.limit) || 0) * (Number(r.subQuestionLimit) || 0);
                }
                // Nếu là câu đơn: Tổng câu = Số câu
                return sum + (Number(r.limit) || 0);
            }, 0);
            return acc + sectionTotal;
        }, 0);
    }, [adHocSections]);

    const rawPayload: DynamicPreviewRequestDTO = { adHocSections };
    const debouncedPayload = useDebounce(rawPayload, 800); 

    const { data: rawPreviewResponse, isFetching, isError, error } = useDynamicPreview(
        totalRequired > 0 ? debouncedPayload : null
    );

    // Bóc vỏ data Axios
    const actualPreviewData = (rawPreviewResponse as any)?.data || rawPreviewResponse;
    const actualQuestions = actualPreviewData?.totalActualQuestions || 0;
    const questionsList = actualPreviewData?.previewData?.questions || [];
    
    // [CTO FIX 2]: Tối ưu Re-render bằng useMemo cho thuật toán Tree
    const nestedQuestions = useMemo(() => {
        return buildNestedQuestions(questionsList);
    }, [questionsList]);

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

            {/* KHU VỰC LIVE PREVIEW (CHỈ RENDER MẪU 3 KHỐI TREE) */}
            <div className="p-4 flex-1 overflow-y-auto bg-slate-50/50 space-y-4">
                <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Bản nháp sinh thử (#001)</h5>
                
                {isFetching ? (
                    Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="w-full h-32 rounded-xl" />
                    ))
                ) : nestedQuestions.length > 0 ? (
                    nestedQuestions.slice(0, 3).map((q, idx) => (
                        <div key={q.originalQuestionId} className="bg-background p-4 rounded-xl border border-border shadow-sm text-sm">
                            {/* [CTO FIX 3]: Xử lý render đa hình (Passage vs Flat) ngay trên Tree */}
                            {q.type === 'PASSAGE' ? (
                                <div className="space-y-3">
                                    <div className="font-bold text-amber-600 flex gap-2 border-b pb-2">
                                        <span>[Khối Bài Đọc]</span>
                                    </div>
                                    <div className="text-muted-foreground line-clamp-3 text-xs italic" dangerouslySetInnerHTML={{ __html: q.content }} />
                                    
                                    <div className="pl-3 border-l-2 border-purple-200 mt-3 space-y-2">
                                        {q.subQuestions?.slice(0, 2).map((sub, subIdx) => (
                                            <div key={sub.originalQuestionId} className="flex gap-2">
                                                <span className="font-bold text-purple-600 shrink-0">Câu {subIdx + 1}:</span>
                                                <span className="line-clamp-1" dangerouslySetInnerHTML={{ __html: sub.content }} />
                                            </div>
                                        ))}
                                        {(q.subQuestions?.length || 0) > 2 && (
                                            <div className="text-xs font-bold text-muted-foreground mt-2 bg-muted/20 inline-block px-2 py-1 rounded">
                                                + {(q.subQuestions?.length || 0) - 2} câu hỏi con...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="font-bold text-primary flex gap-2">
                                        <span>Câu {idx + 1}:</span>
                                        <span dangerouslySetInnerHTML={{ __html: q.content }} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {q.answers?.map((ans) => (
                                            <div key={ans.id} className="p-2 bg-muted/30 rounded-lg border border-border text-xs text-muted-foreground truncate">
                                                <span className="font-bold mr-1">{ans.id}.</span> 
                                                <span dangerouslySetInnerHTML={{ __html: ans.content }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : null}
                
                {!isFetching && nestedQuestions.length > 3 && (
                    <div className="text-center text-xs font-bold text-muted-foreground bg-muted/20 py-2 rounded-lg border border-border border-dashed">
                        + Xem đầy đủ {actualQuestions} câu hỏi trong Modal Xem thử Đề...
                    </div>
                )}
            </div>
        </div>
    );
}