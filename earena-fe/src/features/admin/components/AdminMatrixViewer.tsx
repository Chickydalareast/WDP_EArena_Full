'use client';

import React, { useMemo } from 'react';
import { Network, AlertCircle, Play, Layers, ChevronRight, BookOpen, FileQuestion } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { MatrixSectionDTO } from '@/features/exam-builder/types/exam.schema';

interface AdminMatrixViewerProps {
    sections: MatrixSectionDTO[];
    onDryRun: () => void;
    isDryRunLoading: boolean;
}

const getDifficultyLabel = (diff: string) => {
    const map: Record<string, { label: string; color: string }> = {
        'NB': { label: 'Nhận biết', color: 'bg-green-100 text-green-700 border-green-200' },
        'TH': { label: 'Thông hiểu', color: 'bg-blue-100 text-blue-700 border-blue-200' },
        'VD': { label: 'Vận dụng', color: 'bg-amber-100 text-amber-700 border-amber-200' },
        'VDC': { label: 'Vận dụng cao', color: 'bg-red-100 text-red-700 border-red-200' },
        'EASY': { label: 'Dễ', color: 'bg-green-100 text-green-700 border-green-200' },
        'MEDIUM': { label: 'Trung bình', color: 'bg-amber-100 text-amber-700 border-amber-200' },
        'HARD': { label: 'Khó', color: 'bg-red-100 text-red-700 border-red-200' },
    };
    return map[diff] || { label: diff, color: 'bg-slate-100 text-slate-700 border-slate-200' };
};

const RuleItem = ({ rule, index }: { rule: MatrixSectionDTO['rules'][0], index: number }) => {
    const isPassage = rule.questionType === 'PASSAGE';

    return (
        <div className="bg-background border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm transition-hover hover:border-primary/30">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {index + 1}
                    </div>
                    <div>
                        <h5 className="text-sm font-bold flex items-center gap-2">
                            {isPassage ? (
                                <><BookOpen className="w-4 h-4 text-purple-600" /> Nhóm bài đọc (Ngữ liệu)</>
                            ) : (
                                <><FileQuestion className="w-4 h-4 text-blue-600" /> Câu hỏi đơn (Trắc nghiệm)</>
                            )}
                        </h5>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-sm font-extrabold text-foreground">
                        {rule.limit} {isPassage ? 'Bài đọc' : 'Câu'}
                    </div>
                    {isPassage && rule.subQuestionLimit && (
                        <div className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded mt-1 inline-block">
                            {rule.subQuestionLimit} câu con / bài
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-3 border-t border-dashed border-border/60 flex flex-wrap gap-2">
                {rule.difficulties && rule.difficulties.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                        {rule.difficulties.map(diff => {
                            const diffDisplay = getDifficultyLabel(diff);
                            return (
                                <span key={diff} className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded border", diffDisplay.color)}>
                                    {diffDisplay.label}
                                </span>
                            );
                        })}
                    </div>
                )}

                {(rule.tags?.length || 0) > 0 && (
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                        {rule.tags?.length} Tags
                    </span>
                )}

                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                    <Layers className="w-3 h-3" /> {rule.folderIds?.length || 0} Nguồn
                </span>
            </div>
        </div>
    );
};

export function AdminMatrixViewer({ sections, onDryRun, isDryRunLoading }: AdminMatrixViewerProps) {
    const isEmpty = !sections || sections.length === 0;

    const totalEstimatedQuestions = useMemo(() => {
        if (isEmpty) return 0;
        return sections.reduce((acc, section) => {
            const sectionTotal = (section.rules || []).reduce((sum, rule) => {
                if (rule.questionType === 'PASSAGE') {
                    return sum + (Number(rule.limit) || 0) * (Number(rule.subQuestionLimit) || 0);
                }
                return sum + (Number(rule.limit) || 0);
            }, 0);
            return acc + sectionTotal;
        }, 0);
    }, [sections, isEmpty]);

    return (
        <div className="space-y-6 w-full animate-in fade-in duration-500 pt-4 border-t border-border">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl shrink-0 border border-blue-500/20">
                        <Network className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Cấu trúc Ma trận Đề động</h3>
                        <p className="text-sm text-muted-foreground mt-0.5 font-medium flex items-center gap-2">
                            Dự kiến bốc: <span className="font-bold text-blue-600">{totalEstimatedQuestions} câu hỏi</span>
                        </p>
                    </div>
                </div>

                <Button
                    onClick={onDryRun}
                    disabled={isDryRunLoading || isEmpty}
                    className="gap-2 shadow-md hover:shadow-lg transition-all"
                    size="lg"
                >
                    <Play className={cn("w-4 h-4", isDryRunLoading && "animate-pulse")} fill="currentColor" />
                    {isDryRunLoading ? "Đang chạy thuật toán..." : "Bốc thử đề (Dry-run)"}
                </Button>
            </div>

            {/* Body Area */}
            {isEmpty ? (
                <div className="bg-destructive/5 border border-destructive/20 p-6 rounded-2xl flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-destructive">Bài thi chưa được thiết lập luật bốc câu hỏi</h4>
                        <p className="text-sm text-destructive/80 mt-1 font-medium">
                            Giáo viên đã chọn chế độ "Đề động" nhưng không cấu hình Ma trận. Vui lòng từ chối khóa học và yêu cầu bổ sung.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {sections.map((section, sIdx) => (
                        <div key={sIdx} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                            {/* Section Header */}
                            <div className="bg-muted/40 border-b border-border px-5 py-3.5 flex items-center gap-2">
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                <h4 className="font-bold text-sm text-foreground uppercase tracking-wider">
                                    Phần {sIdx + 1}: {section.name || 'Không tên'}
                                </h4>
                            </div>

                            {/* Section Rules List */}
                            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4 bg-slate-50/50">
                                {section.rules && section.rules.length > 0 ? (
                                    section.rules.map((rule, rIdx) => (
                                        <RuleItem key={rIdx} rule={rule} index={rIdx} />
                                    ))
                                ) : (
                                    <div className="col-span-full p-4 text-center text-sm font-medium text-muted-foreground border border-dashed rounded-xl">
                                        Không có quy tắc bốc đề nào trong phần này.
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}