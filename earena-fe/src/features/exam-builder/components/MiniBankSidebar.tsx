'use client';

import React, { useState } from 'react';
import { useQuestionBankStore } from '@/features/question-bank/stores/question-bank.store';
import { useActiveFilters } from '@/features/exam-builder/hooks/useActiveFilters';
import { useBankQuestions } from '@/features/question-bank/hooks/useBankQueries';
import { useDebounce } from '@/shared/hooks/useDebounce';

import { MiniQuestionCard } from './MiniQuestionCard';
import { TreeSelectMulti } from '@/features/exam-builder/components/TreeSelectMulti';
import type { FolderNode } from '@/features/exam-builder/hooks/useFolders';

import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Search, Loader2, Database, FilterX } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface MiniBankSidebarProps {
    existingQuestionIds: string[];
}

export function MiniBankSidebar({ existingQuestionIds }: MiniBankSidebarProps) {
    const { activePayload, setFilters, resetFilters } = useQuestionBankStore();
    
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data: filtersResponse, isLoading: isLoadingFilters } = useActiveFilters(activePayload);
    const foldersTree = (filtersResponse?.folders ?? []) as FolderNode[];

    const { data: questionsResponse, isFetching: isFetchingQuestions } = useBankQuestions({
        ...activePayload,
        search: debouncedSearch,
        limit: 50, 
    });
    
    const questions = questionsResponse?.items || (questionsResponse as any)?.data || [];

    const hasActiveFilters = activePayload.folderIds && activePayload.folderIds.length > 0;

    return (
        <div className="h-full flex flex-col bg-slate-50 border-l border-border relative">

            <div className="p-4 bg-card border-b border-border shrink-0 space-y-3 shadow-sm z-10 relative">
                <div className="flex items-center justify-between">
                    <h3 className="font-black text-foreground flex items-center gap-2">
                        <Database className="w-4 h-4 text-primary" /> Ngân Hàng Câu Hỏi
                    </h3>
                    
                    {hasActiveFilters && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={resetFilters}
                            title="Xóa bộ lọc"
                        >
                            <FilterX className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {isLoadingFilters ? (
                    <Skeleton className="h-10 w-full rounded-md bg-slate-200" />
                ) : (
                    <TreeSelectMulti 
                        data={foldersTree}
                        selectedIds={activePayload.folderIds || []}
                        onChange={(ids) => setFilters({ folderIds: ids })}
                    />
                )}

                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm theo nội dung..."
                        className="pl-8 bg-slate-50 border-border focus-visible:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 relative">
                
                {isFetchingQuestions && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex justify-center pt-10">
                        <Loader2 className="w-6 h-6 animate-spin text-primary drop-shadow-md" />
                    </div>
                )}

                {!isFetchingQuestions && questions.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl bg-white">
                        Không tìm thấy câu hỏi phù hợp.
                    </div>
                ) : (
                    questions.map((q: any) => (
                        <MiniQuestionCard
                            key={q._id || q.id}
                            question={q}
                            isAlreadyAdded={existingQuestionIds.includes(q._id || q.id)}
                        />
                    ))
                )}
            </div>

        </div>
    );
}