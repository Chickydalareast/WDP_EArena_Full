'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, BookOpen } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { FlatTopic } from '../hooks/useTopics';

export interface TopicSelectorProps {
    value?: string;
    onChange: (value: string) => void;
    topics: FlatTopic[];
    isLoading?: boolean;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

export const TopicSelector = React.memo(({
    value,
    onChange,
    topics,
    isLoading = false,
    disabled = false,
    placeholder = "Tìm và chọn chuyên đề...",
    className
}: TopicSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedTopic = useMemo(() =>
        topics.find(t => t.id === value),
        [topics, value]);

   const filteredTopics = useMemo(() => {
        if (!searchTerm.trim()) return topics;
        const lowerSearch = searchTerm.toLowerCase();
        
        return topics.filter(t => {
            const targetString = t.path || t.name || '';
            return targetString.toLowerCase().includes(lowerSearch);
        });
    }, [topics, searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSelect = (topicId: string) => {
        onChange(topicId);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        onChange('');
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div
                onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
                className={cn(
                    "flex min-h-[40px] w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm transition-all",
                    disabled || isLoading ? "cursor-not-allowed opacity-50 bg-muted" : "cursor-pointer hover:bg-accent hover:border-accent-foreground/20",
                    isOpen && "ring-2 ring-ring border-primary",
                    className
                )}
            >
                {/* [ĐÃ FIX TRUNG TÂM]: overflow-hidden kết hợp min-w-0 */}
                <div className="flex-1 min-w-0 overflow-hidden pr-2 text-left">
                    {isLoading ? (
                        <span className="text-muted-foreground block truncate">Đang tải dữ liệu...</span>
                    ) : selectedTopic ? (
                        <span className="text-foreground font-medium block truncate" title={selectedTopic.path}>
                            {selectedTopic.path}
                        </span>
                    ) : (
                        <span className="text-muted-foreground block truncate">{placeholder}</span>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
                    {selectedTopic && !disabled && (
                        <div
                            onClick={handleClear}
                            className="p-1 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors shrink-0"
                        >
                            <X className="w-3.5 h-3.5" />
                        </div>
                    )}
                    <ChevronDown className={cn("w-4 h-4 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="sticky top-0 flex items-center border-b border-border bg-popover/80 backdrop-blur-sm px-3 py-2 rounded-t-md">
                        <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
                        <input
                            type="text"
                            placeholder="Gõ để tìm kiếm chuyên đề..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground min-w-0"
                            autoFocus
                        />
                    </div>

                    <div className="max-h-[250px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-border">
                        {filteredTopics.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground flex flex-col items-center">
                                <BookOpen className="w-6 h-6 mb-2 opacity-20" />
                                Không tìm thấy chuyên đề phù hợp.
                            </div>
                        ) : (
                            filteredTopics.map((topic) => (
                                <div
                                    key={topic.id}
                                    onClick={() => handleSelect(topic.id)}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2 text-sm rounded-sm cursor-pointer transition-colors mt-0.5",
                                        value === topic.id
                                            ? "bg-primary/10 text-primary font-bold"
                                            : "text-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                    title={topic.path}
                                >
                                    <span className="flex-1 min-w-0 truncate pr-4">{topic.path}</span>
                                    {value === topic.id && <Check className="w-4 h-4 shrink-0" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});
TopicSelector.displayName = 'TopicSelector';