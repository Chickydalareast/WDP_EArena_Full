'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Search, Loader2, CheckCircle2, Box } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useQuizMatricesList } from '../../hooks/useQuizQueries';
import { cn } from '@/shared/lib/utils';

interface MatrixSelectorProps {
    courseId: string;
    selectedMatrixId?: string;
    onSelect: (matrixId: string) => void;
    disabled?: boolean;
}

export function MatrixSelector({ courseId, selectedMatrixId, onSelect, disabled }: MatrixSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data: response, isFetching } = useQuizMatricesList({
        courseId,
        page,
        limit: 5,
        search: debouncedSearch || undefined
    });

    const items = (response as any)?.items || (response as any)?.data?.items || [];
    const meta = (response as any)?.meta || (response as any)?.data?.meta || { totalPages: 1 };

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                    placeholder="Tìm kiếm khuôn mẫu theo tên..." 
                    className="pl-9 border-slate-200 focus-visible:ring-primary/50"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1);
                    }}
                    disabled={disabled}
                />
            </div>

            <div className="space-y-3 min-h-[300px] relative">
                {isFetching && items.length === 0 ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="w-full h-20 rounded-xl" />)
                ) : items.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-slate-50/50 rounded-xl border border-dashed">
                        <Box className="w-10 h-10 mb-2 opacity-50" />
                        <p className="text-sm font-medium">Không tìm thấy khuôn mẫu nào</p>
                    </div>
                ) : (
                    items.map((matrix: any) => {
                        const isSelected = selectedMatrixId === (matrix.id || matrix._id);
                        return (
                            <div 
                                key={matrix.id || matrix._id}
                                onClick={() => !disabled && onSelect(matrix.id || matrix._id)}
                                className={cn(
                                    "p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group",
                                    disabled ? "opacity-60 cursor-not-allowed" : "hover:border-primary/40 hover:shadow-sm",
                                    isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/50" : "bg-white"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1 pr-8">
                                        <h4 className={cn("font-bold transition-colors", isSelected ? "text-primary" : "text-slate-800 group-hover:text-primary/80")}>
                                            {matrix.title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {matrix.description || 'Không có mô tả'}
                                        </p>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground shrink-0 mt-1">
                                        {format(new Date(matrix.createdAt), 'dd/MM/yyyy')}
                                    </div>
                                </div>
                                
                                {isSelected && (
                                    <div className="absolute top-4 right-4 text-primary">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                
                {isFetching && items.length > 0 && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-[1px]">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                )}
            </div>

            {meta.totalPages > 1 && (
                <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-medium text-muted-foreground">
                        Trang {page} / {meta.totalPages}
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="hover:bg-primary/5 hover:text-primary hover:border-primary/30" disabled={page === 1 || disabled} onClick={() => setPage(p => p - 1)}>
                            Trang trước
                        </Button>
                        <Button variant="outline" size="sm" className="hover:bg-primary/5 hover:text-primary hover:border-primary/30" disabled={page === meta.totalPages || disabled} onClick={() => setPage(p => p + 1)}>
                            Trang sau
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}