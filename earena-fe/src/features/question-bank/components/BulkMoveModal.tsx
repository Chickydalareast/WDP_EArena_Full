'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Loader2, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { useFolderTree, useBulkMoveQuestions } from '../hooks/useBankQueries';
import { useQuestionBankStore } from '../stores/question-bank.store';
import { FolderNode } from '../types/question-bank.schema';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';

interface BulkMoveModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BulkMoveModal({ isOpen, onClose }: BulkMoveModalProps) {
    const { data: treeData, isLoading: isTreeLoading } = useFolderTree();
    const { mutate: bulkMove, isPending: isMoving } = useBulkMoveQuestions();

    const selectedQuestionIds = useQuestionBankStore(state => state.selectedQuestionIds);
    const clearSelection = useQuestionBankStore(state => state.clearQuestionSelection);

    const [destFolderId, setDestFolderId] = useState<string | null>(null);
    const [localExpanded, setLocalExpanded] = useState<string[]>([]);

    // Reset destFolderId khi mở modal
    useEffect(() => {
        if (isOpen) setDestFolderId(null);
    }, [isOpen]);

    const handleToggle = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setLocalExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleConfirm = () => {
        if (!destFolderId) return toast.error('Vui lòng chọn thư mục đích');

        bulkMove(
            { questionIds: selectedQuestionIds, destFolderId },
            {
                onSuccess: () => {
                    clearSelection();
                    onClose();
                }
            }
        );
    };

    const renderMiniTree = (nodes: FolderNode[], level = 0) => {
        return nodes.map(node => {
            const isExpanded = localExpanded.includes(node._id);
            const isSelected = destFolderId === node._id;
            const hasChildren = node.children && node.children.length > 0;

            return (
                <div key={node._id} className="w-full">
                    <div
                        onClick={() => setDestFolderId(node._id)}
                        className={cn(
                            "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors mt-0.5 text-sm",
                            isSelected ? "bg-blue-100 text-blue-700 font-bold" : "hover:bg-slate-100 text-slate-700"
                        )}
                        style={{ paddingLeft: `${level * 16 + 8}px` }}
                    >
                        <div onClick={(e) => handleToggle(node._id, e)} className={cn("w-4 h-4 flex items-center justify-center", !hasChildren && "invisible")}>
                            {isExpanded ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                        </div>
                        <FolderOpen className={cn("w-4 h-4", isSelected ? "text-blue-600" : "text-slate-400")} />
                        <span className="truncate">{node.name}</span>
                    </div>
                    {isExpanded && hasChildren && renderMiniTree(node.children!, level + 1)}
                </div>
            );
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Di chuyển {selectedQuestionIds.length} câu hỏi</DialogTitle>
                    <DialogDescription>Chọn thư mục đích để chuyển các câu hỏi này tới.</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 min-h-[300px] max-h-[500px] overflow-hidden">
                    {/* Cây thư mục gốc */}
                    <div className="flex-1 overflow-y-auto border rounded-lg p-2 bg-slate-50">
                        {isTreeLoading ? (
                            <div className="flex justify-center items-center h-full text-slate-400">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        ) : treeData && treeData.length > 0 ? (
                            renderMiniTree(treeData)
                        ) : (
                            <div className="text-center p-4 text-sm text-slate-500">Không có thư mục nào</div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={isMoving}>Hủy</Button>
                    <Button onClick={handleConfirm} disabled={isMoving || !destFolderId}>
                        {isMoving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Xác nhận chuyển
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}