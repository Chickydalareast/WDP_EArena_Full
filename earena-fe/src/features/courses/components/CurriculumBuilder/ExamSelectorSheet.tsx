'use client';

import React, { useState, useMemo } from 'react';
import { useTeacherExams } from '@/features/exam-builder/hooks/useTeacherExams';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/shared/components/ui/sheet';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Loader2, Search, FileText, CheckCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface ExamSelectorSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectExam: (examId: string, examTitle: string) => void;
    currentExamId?: string; // Dùng để highlight đề đang được chọn
}

export function ExamSelectorSheet({ isOpen, onClose, onSelectExam, currentExamId }: ExamSelectorSheetProps) {
    const { data: examsData, isLoading } = useTeacherExams();
    const [searchQuery, setSearchQuery] = useState('');

    // Lọc Data mượt mà trên Client, tránh re-render thừa
    const filteredExams = useMemo(() => {
        const raw = examsData as unknown;
        const examsList = Array.isArray(raw)
            ? raw
            : (raw && typeof raw === 'object' && 'items' in raw
                ? (raw as { items: unknown[] }).items
                : (raw && typeof raw === 'object' && 'data' in raw
                    ? (raw as { data: unknown[] }).data
                    : [])) || [];
        if (!searchQuery) return examsList;
        return examsList.filter((exam: any) =>
            exam.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [examsData, searchQuery]);

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 border-l border-border bg-slate-50">
                <div className="p-6 border-b bg-white">
                    <SheetHeader className="mb-4">
                        <SheetTitle className="text-xl font-bold text-slate-800">Chọn Đề Thi (Quiz)</SheetTitle>
                        <SheetDescription>
                            Gắn một đề thi đã tạo vào bài học để làm bài kiểm tra.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Tìm kiếm tên đề thi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-slate-50 border-slate-200"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-xl bg-slate-200" />
                        ))
                    ) : filteredExams.length === 0 ? (
                        <div className="text-center p-8 text-slate-500">
                            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                            <p>Không tìm thấy đề thi nào.</p>
                        </div>
                    ) : (
                        filteredExams.map((exam: any) => {
                            const examId = exam._id || exam.id;
                            const isSelected = currentExamId === examId;

                            return (
                                <div
                                    key={examId}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-3 group ${isSelected
                                            ? 'bg-blue-50 border-blue-300 shadow-sm ring-1 ring-blue-500'
                                            : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                                        }`}
                                    onClick={() => {
                                        onSelectExam(examId, exam.title);
                                        onClose();
                                    }}
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        <h4 className={`font-semibold line-clamp-2 text-sm ${isSelected ? 'text-blue-700' : 'text-slate-800 group-hover:text-blue-600'}`}>
                                            {exam.title}
                                        </h4>
                                        {isSelected && <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {exam.duration} phút</span>
                                        <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> {exam.totalScore} điểm</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}