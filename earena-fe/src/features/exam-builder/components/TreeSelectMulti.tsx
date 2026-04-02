'use client';

import React, { useState, useCallback } from 'react';
import { Folder, ChevronRight, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Button } from '@/shared/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { cn } from '@/shared/lib/utils';
import { FolderNode } from '../hooks/useFolders';

interface TreeSelectMultiProps {
    data: FolderNode[];
    selectedIds: string[];
    onChange: (selectedIds: string[]) => void;
    disabled?: boolean;
    availableIds?: string[];
}

type SafeFolderNode = FolderNode & { _id?: string; id?: string; children?: FolderNode[] };

interface TreeNodeProps {
    node: FolderNode;
    depth: number;
    selectedIds: string[];
    onToggleCheck: (id: string, checked: boolean) => void;
    disabled?: boolean;
    availableIds?: string[];
}

const TreeNode = React.memo(({ node, depth, selectedIds, onToggleCheck, disabled, availableIds }: TreeNodeProps) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(depth < 1);
    const safeNode = node as SafeFolderNode;
    const safeId = String(safeNode._id ?? safeNode.id ?? ''); 
    const isChecked = selectedIds.includes(safeId);
    const hasChildren = Array.isArray(safeNode.children) && safeNode.children.length > 0;
    const isAvailable = availableIds ? availableIds.includes(safeId) : true;
    const isEffectivelyDisabled = disabled || !isAvailable;

    return (
        <div className="flex flex-col">
            <div className={cn(
                "flex items-center gap-2 py-1.5 px-2 hover:bg-slate-100 rounded-md transition-colors group",
                isEffectivelyDisabled && "opacity-50"
            )} style={{ paddingLeft: `${depth * 16 + 8}px` }}>
                
                <div
                    className={cn("w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-800", hasChildren ? "cursor-pointer" : "")}
                    onClick={(e) => { e.stopPropagation(); if (hasChildren) setIsExpanded(!isExpanded); }}
                >
                    {hasChildren ? (isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) : <span className="w-4 h-4" />}
                </div>

                {/* [CTO UI FIX]: Đổi màu Checkbox sang bg-primary (màu hồng của App) */}
                <Checkbox
                    checked={isChecked}
                    disabled={isEffectivelyDisabled}
                    onCheckedChange={(checked) => onToggleCheck(safeId, !!checked)}
                    className={cn(
                        "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
                        isEffectivelyDisabled && "cursor-not-allowed"
                    )}
                />

                <label
                    className={cn("flex flex-1 items-center gap-2 text-sm font-medium text-slate-700 truncate", isEffectivelyDisabled ? "cursor-not-allowed" : "cursor-pointer")}
                    onClick={(e) => { e.stopPropagation(); if (!isEffectivelyDisabled) onToggleCheck(safeId, !isChecked); }}
                >
                    {/* [CTO UI FIX]: Đổi màu icon Folder sang text-primary/70 */}
                    <Folder className={cn("w-4 h-4 shrink-0", isEffectivelyDisabled ? "text-slate-400" : "text-primary/70")} />
                    <span className="truncate" title={node.name}>{node.name}</span>
                </label>
            </div>

            {isExpanded && hasChildren && (
                <div className="flex flex-col">
                    {safeNode.children!.map((child, index) => {
                        const childSafeNode = child as SafeFolderNode;
                        const childSafeId = String(childSafeNode._id ?? childSafeNode.id ?? `fallback-${depth}-${index}`);
                        return (
                            <TreeNode 
                                key={childSafeId} 
                                node={child} 
                                depth={depth + 1} 
                                selectedIds={selectedIds} 
                                onToggleCheck={onToggleCheck} 
                                disabled={disabled}
                                availableIds={availableIds}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
});
TreeNode.displayName = 'TreeNode';

export function TreeSelectMulti({ data, selectedIds = [], onChange, disabled = false, availableIds }: TreeSelectMultiProps) {
    const [open, setOpen] = useState(false);

    const handleToggleCheck = useCallback((id: string, checked: boolean) => {
        if (disabled) return;
        if (checked) onChange([...selectedIds, id]);
        else onChange(selectedIds.filter(itemId => itemId !== id));
    }, [disabled, selectedIds, onChange]);

    const displayText = selectedIds.length > 0 ? `Đã chọn ${selectedIds.length} thư mục` : 'Chọn thư mục...';

return (
        <Popover open={open} onOpenChange={setOpen} modal={true}> 
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className="w-full justify-between h-10 bg-white font-normal shadow-sm"
                >
                    <span className={cn("truncate", selectedIds.length === 0 && "text-slate-500")}>
                        {displayText}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="start">
                {!data || data.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-sm">Chưa có thư mục nào.</div>
                ) : (
                    <div className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
                        {data.map((rootNode, index) => {
                            const safeRoot = rootNode as SafeFolderNode;
                            const rootSafeId = String(safeRoot._id ?? safeRoot.id ?? `fallback-root-${index}`);
                            return (
                                <TreeNode 
                                    key={rootSafeId} 
                                    node={rootNode} 
                                    depth={0} 
                                    selectedIds={selectedIds} 
                                    onToggleCheck={handleToggleCheck} 
                                    disabled={disabled}
                                    availableIds={availableIds}
                                />
                            );
                        })}
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}