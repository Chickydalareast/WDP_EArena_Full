'use client';

import React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Inbox, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { QuizAttemptItem } from '../../../types/course.schema';

interface QuizAttemptsTableProps {
    data: QuizAttemptItem[];
    meta: {
        totalItems: number;
        currentPage: number;
        totalPages: number;
    };
    isFetching: boolean;
    onPageChange: (page: number) => void;
}

export function QuizAttemptsTable({ data, meta, isFetching, onPageChange }: QuizAttemptsTableProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-slate-50 text-slate-400">
                <Inbox className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-sm font-medium">Chưa có dữ liệu làm bài.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                <div className="overflow-x-auto relative">
                    {/* Lớp phủ mờ khi đang fetch trang mới */}
                    {isFetching && (
                        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    )}
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 font-bold">Học viên</th>
                                <th className="px-4 py-3 font-bold text-center">Trạng thái</th>
                                <th className="px-4 py-3 font-bold text-center">Điểm số</th>
                                <th className="px-4 py-3 font-bold">Thời gian nộp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.map((item) => (
                                <tr key={item.id} className="bg-background hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-foreground">{item.studentName}</div>
                                        <div className="text-xs text-muted-foreground">{item.studentEmail || 'Ẩn email'}</div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase",
                                            item.status === 'COMPLETED' ? "bg-green-100 text-green-700" :
                                            item.status === 'IN_PROGRESS' ? "bg-blue-100 text-blue-700" :
                                            "bg-slate-100 text-slate-700"
                                        )}>
                                            {item.status === 'COMPLETED' ? 'Đã Nộp' :
                                             item.status === 'IN_PROGRESS' ? 'Đang Làm' : 'Bỏ Cuộc'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold text-primary">
                                        {item.score !== null ? `${item.score}` : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                        {item.completedAt 
                                            ? format(new Date(item.completedAt), 'dd/MM/yyyy - HH:mm') 
                                            : '--/--/----'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">
                        Hiển thị {(meta.currentPage - 1) * 10 + 1} - {Math.min(meta.currentPage * 10, meta.totalItems)} trong tổng số <strong className="text-foreground">{meta.totalItems}</strong> lượt
                    </span>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" size="sm" 
                            disabled={meta.currentPage === 1 || isFetching}
                            onClick={() => onPageChange(meta.currentPage - 1)}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="font-bold w-8 text-center text-primary">{meta.currentPage}</span>
                        <Button 
                            variant="outline" size="sm" 
                            disabled={meta.currentPage === meta.totalPages || isFetching}
                            onClick={() => onPageChange(meta.currentPage + 1)}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}