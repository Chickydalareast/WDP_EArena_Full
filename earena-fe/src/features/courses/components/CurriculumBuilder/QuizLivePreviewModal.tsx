'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { FileText, CheckCircle2, ScrollText } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { NestedQuestionPreview } from '../../lib/quiz-utils';

interface QuizLivePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    questions: NestedQuestionPreview[];
    totalItems: number;
    totalActualQuestions: number;
}

export function QuizLivePreviewModal({ isOpen, onClose, questions, totalItems, totalActualQuestions }: QuizLivePreviewModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col p-0 overflow-hidden bg-slate-50">
                <DialogHeader className="px-6 py-4 border-b bg-white shrink-0">
                    <DialogTitle className="text-xl flex items-center gap-2 text-purple-900">
                        <FileText className="w-5 h-5 text-purple-600" /> Bản nháp Đề thi (Dry-Run)
                    </DialogTitle>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground font-medium">
                        <span className="flex items-center gap-1"><ScrollText className="w-4 h-4"/> Tổng elements: {totalItems}</span>
                        <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-4 h-4"/> Câu hỏi thực tế: {totalActualQuestions}</span>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {questions.length === 0 ? (
                        <div className="text-center p-10 text-muted-foreground">Không có dữ liệu đề thi.</div>
                    ) : (
                        questions.map((q, index) => (
                            <div key={q.originalQuestionId} className="bg-white p-5 rounded-xl border shadow-sm">
                                
                                {/* XỬ LÝ ĐOẠN VĂN MẸ */}
                                {q.type === 'PASSAGE' ? (
                                    <div className="space-y-4">
                                        <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                                            <div className="text-xs font-bold text-amber-600 uppercase mb-2">Đoạn văn / Ngữ liệu</div>
                                            <div className="text-sm font-medium leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: q.content }} />
                                        </div>
                                        
                                        <div className="pl-4 border-l-2 border-purple-200 space-y-4 mt-4">
                                            {q.subQuestions?.map((subQ, subIdx) => (
                                                <div key={subQ.originalQuestionId} className="space-y-2">
                                                    <div className="font-bold text-sm flex gap-2">
                                                        <span className="text-purple-600">Câu {subIdx + 1}:</span>
                                                        <span dangerouslySetInnerHTML={{ __html: subQ.content }} />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        {subQ.answers?.map((ans) => (
                                                            <div key={ans.id} className="p-2 bg-slate-50 border rounded-lg text-xs flex gap-2">
                                                                <span className="font-bold text-slate-500">{ans.id}.</span> 
                                                                <span dangerouslySetInnerHTML={{ __html: ans.content }} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    /* XỬ LÝ CÂU TRẮC NGHIỆM ĐƠN */
                                    <div className="space-y-3">
                                        <div className="font-bold text-sm flex gap-2">
                                            <span className="text-purple-600">Câu {index + 1}:</span>
                                            <span dangerouslySetInnerHTML={{ __html: q.content }} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            {q.answers?.map((ans) => (
                                                <div key={ans.id} className="p-2 bg-slate-50 border rounded-lg text-xs flex gap-2">
                                                    <span className="font-bold text-slate-500">{ans.id}.</span> 
                                                    <span dangerouslySetInnerHTML={{ __html: ans.content }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}