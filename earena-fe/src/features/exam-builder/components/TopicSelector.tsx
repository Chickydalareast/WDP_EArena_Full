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

    // Tìm object topic đang được chọn dựa vào value (ID)
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

    // Xử lý đóng Dropdown khi click ra ngoài vùng component
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
        setSearchTerm(''); // Xóa từ khóa search khi đã chọn xong
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation(); // Tránh trigger mở dropdown
        onChange('');
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* NÚT TRIGGER (Giao diện giống thẻ Input thông thường) */}
            <div
                onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
                className={cn(
                    "flex min-h-[40px] w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm transition-all",
                    disabled || isLoading ? "cursor-not-allowed opacity-50 bg-slate-50" : "cursor-pointer hover:bg-slate-50 hover:border-blue-300",
                    isOpen && "ring-2 ring-blue-500/20 border-blue-500",
                    className
                )}
            >
                {/* --- ĐÃ FIX LỖI VỠ UI --- */}
                {/* Thêm min-w-0 và block truncate để buộc text phải tự động cắt ngắn */}
                <div className="flex-1 min-w-0 truncate pr-2 text-left">
                    {isLoading ? (
                        <span className="text-slate-400 block truncate">Đang tải dữ liệu...</span>
                    ) : selectedTopic ? (
                        <span className="text-slate-800 font-medium block truncate" title={selectedTopic.path}>
                            {selectedTopic.path}
                        </span>
                    ) : (
                        <span className="text-slate-400 block truncate">{placeholder}</span>
                    )}
                </div>

                {/* Thêm shrink-0 vào icons để không bao giờ bị bóp méo */}
                <div className="flex items-center gap-1 shrink-0 text-slate-400">
                    {selectedTopic && !disabled && (
                        <div
                            onClick={handleClear}
                            className="p-1 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0"
                        >
                            <X className="w-3.5 h-3.5" />
                        </div>
                    )}
                    <ChevronDown className={cn("w-4 h-4 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
                </div>
            </div>

            {/* BẢNG DROPDOWN (Tuyệt đối, đè lên các UI khác) */}
            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Thanh Search dính chặt phía trên */}
                    <div className="sticky top-0 flex items-center border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm px-3 py-2 rounded-t-md">
                        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                        <input
                            type="text"
                            placeholder="Gõ để tìm kiếm chuyên đề..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400 min-w-0"
                            autoFocus
                        />
                    </div>

                    {/* Danh sách cuộn */}
                    <div className="max-h-[250px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200">
                        {filteredTopics.length === 0 ? (
                            <div className="py-6 text-center text-sm text-slate-500 flex flex-col items-center">
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
                                            ? "bg-blue-50 text-blue-700 font-bold"
                                            : "text-slate-700 hover:bg-slate-100"
                                    )}
                                    title={topic.path}
                                >
                                    {/* Thêm flex-1 min-w-0 để danh sách cũng tự động cắt text */}
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