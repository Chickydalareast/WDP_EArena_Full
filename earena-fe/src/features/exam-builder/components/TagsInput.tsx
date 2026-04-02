'use client';

import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';

interface TagsInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function TagsInput({ value = [], onChange, placeholder = 'Nhập tag và ấn Enter...', disabled = false, className }: TagsInputProps) {
    const [inputValue, setInputValue] = useState<string>('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        // Chặn sự kiện submit form bọc ngoài
        if (e.key === 'Enter') {
            e.preventDefault();

            const newTag = inputValue.trim();
            if (newTag && !value.includes(newTag)) {
                onChange([...value, newTag]);
                setInputValue('');
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        if (disabled) return;
        onChange(value.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <Input
                type="text"
                value={inputValue}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
            />

            {value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {value.map((tag) => (
                        <div
                            key={tag}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 transition-colors"
                        >
                            <span className="max-w-[150px] truncate">{tag}</span>
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="ml-1.5 hover:bg-indigo-200 hover:text-indigo-900 rounded-full p-0.5 focus:outline-none"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}