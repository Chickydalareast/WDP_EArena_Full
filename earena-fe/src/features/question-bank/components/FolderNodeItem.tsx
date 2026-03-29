'use client';

import React from 'react';
import { FolderNode } from '../types/question-bank.schema';
import { useQuestionBankStore } from '../stores/question-bank.store';
import { cn } from '@/shared/lib/utils';
import { ChevronRight, ChevronDown, Folder, FolderOpen, MoreVertical, Plus, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';

interface FolderNodeItemProps {
    node: FolderNode;
    level?: number;
    onAction: (action: 'CREATE_CHILD' | 'EDIT' | 'DELETE', node: FolderNode) => void;
}

export const FolderNodeItem = React.memo(({ node, level = 0, onAction }: FolderNodeItemProps) => {
    const selectedFolderId = useQuestionBankStore(state => state.selectedFolderId);
    const setSelectedFolderId = useQuestionBankStore(state => state.setSelectedFolderId);
    const expandedFolderIds = useQuestionBankStore(state => state.expandedFolderIds);
    const toggleFolderExpand = useQuestionBankStore(state => state.toggleFolderExpand);

    const isExpanded = expandedFolderIds.includes(node._id);
    const isSelected = selectedFolderId === node._id;
    const hasChildren = node.children && node.children.length > 0;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation(); // Chặn select folder khi bấm mũi tên
        toggleFolderExpand(node._id);
    };

    const handleSelect = () => {
        setSelectedFolderId(node._id);
    };

    return (
        <div className="w-full">
            <div
                className={cn(
                    "group flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition-colors mt-0.5 text-sm font-medium",
                    isSelected ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100",
                )}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={handleSelect}
            >
                <div className="flex items-center gap-1.5 truncate flex-1">
                    {/* Mũi tên Expand/Collapse */}
                    <div
                        className={cn("w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 transition-colors", !hasChildren && "invisible")}
                        onClick={handleToggle}
                    >
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    </div>

                    {/* Icon Folder */}
                    {isExpanded && hasChildren ? (
                        <FolderOpen className={cn("w-4 h-4 shrink-0", isSelected ? "text-blue-600" : "text-amber-500")} />
                    ) : (
                        <Folder className={cn("w-4 h-4 shrink-0", isSelected ? "text-blue-600" : "text-amber-500")} />
                    )}

                    <span className="truncate">{node.name}</span>
                </div>

                {/* Action Menu (3 chấm) - Chỉ hiện khi hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="p-1 rounded hover:bg-slate-200 cursor-pointer text-slate-500">
                                <MoreVertical className="w-4 h-4" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onAction('CREATE_CHILD', node)}>
                                <Plus className="w-4 h-4 mr-2" /> Thêm thư mục con
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAction('EDIT', node)}>
                                <Edit className="w-4 h-4 mr-2" /> Đổi tên
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAction('DELETE', node)} className="text-red-600 focus:text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" /> Xóa thư mục
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* RENDER CON ĐỆ QUY */}
            {isExpanded && hasChildren && (
                <div className="w-full">
                    {node.children!.map(childNode => (
                        <FolderNodeItem
                            key={childNode._id}
                            node={childNode}
                            level={level + 1}
                            onAction={onAction}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});
FolderNodeItem.displayName = 'FolderNodeItem';