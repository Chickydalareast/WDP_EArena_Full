'use client';

import React, { useState, useMemo } from 'react';
import { useFolderTree, useBankQuestions } from '@/features/question-bank/hooks/useBankQueries';
import { FolderNode } from '@/features/question-bank/types/question-bank.schema';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { MiniQuestionCard } from './MiniQuestionCard';

import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Search, Loader2, Database } from 'lucide-react';

interface MiniBankSidebarProps {
    existingQuestionIds: string[]; // Mảng ID các câu đã có trong đề (để disable)
}

// Helper: Làm phẳng cây thư mục để tống vào Dropdown Select cho gọn
const flattenTreeForSelect = (nodes: FolderNode[], depth = 0): { _id: string; name: string }[] => {
    let result: { _id: string; name: string }[] = [];
    for (const node of nodes) {
        result.push({ _id: node._id, name: `${'— '.repeat(depth)}${node.name}` });
        if (node.children && node.children.length > 0) {
            result = result.concat(flattenTreeForSelect(node.children, depth + 1));
        }
    }
    return result;
};

export function MiniBankSidebar({ existingQuestionIds }: MiniBankSidebarProps) {
    // Local States để quản lý Filter độc lập
    const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Queries
    const { data: treeData, isLoading: isLoadingTree } = useFolderTree();

    // Tối ưu Performance: Chỉ chạy lại Flatten khi treeData thay đổi
    const flatFolders = useMemo(() => {
        if (!treeData) return [];
        return flattenTreeForSelect(treeData);
    }, [treeData]);

    const { data: response, isLoading: isLoadingQuestions } = useBankQuestions({
        folderId: selectedFolderId === 'all' ? undefined : selectedFolderId,
        search: debouncedSearch,
        limit: 50, // Lấy nhiều hơn 1 chút để kéo thả đã tay
    });

    const questions = response?.items || (response as any)?.data || [];

    return (
        <div className="h-full flex flex-col bg-slate-50 border-l border-slate-200">

            {/* 1. HEADER & FILTERS */}
            <div className="p-4 bg-white border-b shrink-0 space-y-3">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" /> Ngân Hàng Kéo Thả
                </h3>

                {isLoadingTree ? (
                    <Skeleton className="h-10 w-full" />
                ) : (
                    <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                        <SelectTrigger className="w-full bg-slate-50">
                            <SelectValue placeholder="Chọn thư mục..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="font-bold text-blue-600">Tất cả câu hỏi</SelectItem>
                            {flatFolders.map(folder => (
                                <SelectItem key={folder._id} value={folder._id}>
                                    {folder.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Tìm theo nội dung..."
                        className="pl-8 bg-slate-50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* 2. DRAGGABLE LIST (DANH SÁCH KÉO THẢ) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-200">
                {isLoadingQuestions ? (
                    <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
                ) : questions.length === 0 ? (
                    <div className="text-center p-8 text-slate-400 text-sm border-2 border-dashed rounded-xl">
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