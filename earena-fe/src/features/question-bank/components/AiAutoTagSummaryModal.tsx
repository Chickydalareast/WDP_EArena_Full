'use client';

import React, { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Sparkles, CheckCircle2, Tag, BookOpen, Layers } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

import { useQuestionBankStore } from '../stores/question-bank.store';
import { useSession } from '@/features/auth/hooks/useSession';
import { PopulatedQuestion } from '@/features/exam-builder/lib/hydration-utils';
import { BANK_QUESTIONS_KEY } from '../hooks/useBankQueries';
import { useTopicsTree } from '@/features/exam-builder/hooks/useTopics';

// Hàm loại bỏ thẻ HTML an toàn để làm Text Preview
const stripHtml = (html: string) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

const getDifficultyStyles = (level: string) => {
    switch(level) {
        case 'NB': return { text: 'Nhận biết', style: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
        case 'TH': return { text: 'Thông hiểu', style: 'bg-blue-100 text-blue-700 border-blue-200' };
        case 'VD': return { text: 'Vận dụng', style: 'bg-amber-100 text-amber-700 border-amber-200' };
        case 'VDC': return { text: 'Vận dụng cao', style: 'bg-rose-100 text-rose-700 border-rose-200' };
        default: return { text: 'Chưa phân loại', style: 'bg-slate-100 text-slate-500 border-slate-200' };
    }
};

interface AiAutoTagSummaryModalProps {
    originalQuestions: PopulatedQuestion[];
}

export const AiAutoTagSummaryModal = React.memo(({ originalQuestions }: AiAutoTagSummaryModalProps) => {
    const queryClient = useQueryClient();
    const isSummaryModalOpen = useQuestionBankStore(state => state.isSummaryModalOpen);
    const aiProcessedQuestions = useQuestionBankStore(state => state.aiProcessedQuestions);
    const clearAiProcessState = useQuestionBankStore(state => state.clearAiProcessState);

    // Lấy cây chuyên đề để map tên
    const { user } = useSession();
    const subjectId = user?.subjects?.[0]?.id;
    const { data: topics = [] } = useTopicsTree(subjectId);
    
    const topicsMap = useMemo(() => {
        const map: Record<string, string> = {};
        topics.forEach(t => { map[t.id] = t.path; });
        return map;
    }, [topics]);

    // Hợp nhất dữ liệu: Lấy ID từ AI data -> Map nội dung từ Original data
    const previewList = useMemo(() => {
        return aiProcessedQuestions.map(aiItem => {
            const originalQ = originalQuestions.find(q => (q._id === aiItem.id || q.originalQuestionId === aiItem.id));
            const rawText = stripHtml(originalQ?.content || 'Nội dung không khả dụng...');
            const previewText = rawText.length > 120 ? rawText.substring(0, 120) + '...' : rawText;

            return {
                ...aiItem,
                previewText,
                isPassage: originalQ?.type === 'PASSAGE'
            };
        });
    }, [aiProcessedQuestions, originalQuestions]);

    // Đóng an toàn: Clear trạng thái và ép gọi API GET lại 1 lần cuối để đồng bộ 100%
    const handleCloseAndSync = (isOpen: boolean) => {
        if (!isOpen) {
            clearAiProcessState();
            queryClient.invalidateQueries({ queryKey: BANK_QUESTIONS_KEY });
        }
    };

    return (
        <Dialog open={isSummaryModalOpen} onOpenChange={handleCloseAndSync}>
            <DialogContent className="sm:max-w-2xl bg-white p-0 overflow-hidden shadow-2xl rounded-2xl">
                
                {/* HEADER HOÀNH TRÁNG */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 px-6 py-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
                        <Sparkles className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-white">
                        Phân loại hoàn tất!
                    </DialogTitle>
                    <DialogDescription className="text-purple-100 mt-2 text-base">
                        AI đã đọc hiểu và gán thuộc tính thành công cho <strong>{aiProcessedQuestions.length}</strong> câu hỏi.
                    </DialogDescription>
                </div>

                {/* BODY DANH SÁCH RÚT GỌN */}
                <div className="max-h-[50vh] overflow-y-auto p-6 bg-slate-50/50 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
                    {previewList.map((item, index) => {
                        const diffData = getDifficultyStyles(item.difficultyLevel);
                        return (
                            <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-purple-300 transition-colors relative">
                                <div className="absolute -left-2 top-4 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm">
                                    {index + 1}
                                </div>
                                
                                <div className="pl-4">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        {item.isPassage ? (
                                            <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded flex items-center gap-1 border border-purple-200">
                                                <Layers className="w-3 h-3" /> Bài đọc
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                                Câu đơn
                                            </span>
                                        )}

                                        {item.difficultyLevel !== 'UNKNOWN' && (
                                            <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded border", diffData.style)}>
                                                {diffData.text}
                                            </span>
                                        )}
                                        
                                        {item.topicId && topicsMap[item.topicId] && (
                                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[200px]" title={topicsMap[item.topicId]}>
                                                {topicsMap[item.topicId]}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-slate-600 font-medium italic line-clamp-2 leading-relaxed">
                                        "{item.previewText}"
                                    </p>

                                    {item.tags && item.tags.length > 0 && (
                                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 mt-3 pt-3 border-t border-slate-100 border-dashed">
                                            <Tag className="w-3 h-3 text-slate-400" />
                                            {item.tags.map((tag: string) => (
                                                <span key={tag} className="bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* FOOTER */}
                <DialogFooter className="p-4 border-t bg-white">
                    <Button 
                        onClick={() => handleCloseAndSync(false)} 
                        className="w-full bg-slate-900 text-white hover:bg-slate-800 font-bold py-6 text-md shadow-lg"
                    >
                        <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-400" /> 
                        Đóng và Tải lại dữ liệu
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});
AiAutoTagSummaryModal.displayName = 'AiAutoTagSummaryModal';