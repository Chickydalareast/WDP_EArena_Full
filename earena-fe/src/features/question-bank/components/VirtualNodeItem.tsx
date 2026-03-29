'use client';

import React, { useState } from 'react';
import { FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { NestedVirtualNode } from '../lib/tree-utils';
import { cn } from '@/shared/lib/utils';

interface VirtualNodeItemProps {
    node: NestedVirtualNode;
    level?: number;
}

export const VirtualNodeItem = React.memo(({ node, level = 0 }: VirtualNodeItemProps) => {
    const hasChildren = node.children && node.children.length > 0;
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="w-full">
            <div
                className={cn(
                    "flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors text-sm hover:bg-slate-50",
                    node.isNew ? "bg-primary/5 border border-primary/20" : ""
                )}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
                <div
                    onClick={() => hasChildren && setIsExpanded(!isExpanded)}
                    className={cn("w-4 h-4 flex items-center justify-center cursor-pointer", !hasChildren && "invisible")}
                >
                    {isExpanded ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                </div>

                <FolderOpen className={cn("w-4 h-4", node.isNew ? "text-primary" : "text-slate-400")} />

                <span className={cn("truncate", node.isNew ? "font-bold text-primary" : "font-medium text-slate-700")}>
                    {node.name}
                </span>

                {node.isNew && (
                    <span className="text-[9px] font-black bg-primary text-primary-foreground px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                        Mới
                    </span>
                )}

                {node.questionCount > 0 && (
                    <span className="text-xs text-slate-500 ml-auto font-medium bg-white px-2 py-0.5 rounded border shadow-sm">
                        {node.questionCount} câu
                    </span>
                )}
            </div>

            {isExpanded && hasChildren && (
                <div className="flex flex-col">
                    {node.children.map(child => (
                        <VirtualNodeItem key={child._id} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
});
VirtualNodeItem.displayName = 'VirtualNodeItem';