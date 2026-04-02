'use client';

import * as React from 'react';
import { X, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/components/ui/popover';

// [CTO FIX]: Export interface ra ngoài và bổ sung cờ disabled
export interface Option {
    label: string;
    value: string;
    disabled?: boolean; 
}

interface MultiSelectProps {
    options: Option[];
    selected: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function MultiSelect({ options, selected, onChange, placeholder = 'Chọn...', disabled }: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const handleUnselect = (value: string) => {
        onChange(selected.filter((s) => s !== value));
    };

    const handleSelect = (value: string) => {
        if (selected.includes(value)) {
            handleUnselect(value);
        } else {
            onChange([...selected, value]);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className="w-full justify-between h-auto min-h-10 bg-white shadow-sm"
                    onClick={() => setOpen(!open)}
                >
                    <div className="flex flex-wrap gap-1">
                        {selected.length === 0 && <span className="text-muted-foreground font-normal">{placeholder}</span>}
                        {selected.map((val) => {
                            const option = options.find((o) => o.value === val);
                            if (!option) return null;
                            return (
                                <div
                                    key={val}
                                    className="flex items-center gap-1 bg-slate-100 rounded-sm px-2 py-0.5 text-xs font-semibold text-slate-700"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleUnselect(val);
                                    }}
                                >
                                    {option.label}
                                    <X className="h-3 w-3 hover:text-destructive cursor-pointer transition-colors" />
                                </div>
                            );
                        })}
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 max-h-[250px] overflow-y-auto" align="start">
                <div className="flex flex-col p-1">
                    {options.length === 0 ? (
                        <div className="p-4 text-sm text-slate-500 text-center">Không có dữ liệu</div>
                    ) : (
                        options.map((option) => {
                            const isSelected = selected.includes(option.value);
                            return (
                                <div
                                    key={option.value}
                                    className={cn(
                                        "relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                                        isSelected ? "bg-primary/10 text-primary font-medium" : "",
                                        // [CTO FIX]: Tách biệt CSS khi Enabled vs Disabled
                                        option.disabled
                                            ? "opacity-50 cursor-not-allowed bg-slate-50/50"
                                            : "cursor-pointer hover:bg-slate-100 hover:text-slate-900"
                                    )}
                                    onClick={(e) => {
                                        // [CTO FIX]: Chặn cứng sự kiện click nếu item bị disabled
                                        if (option.disabled) {
                                            e.preventDefault();
                                            return;
                                        }
                                        handleSelect(option.value);
                                    }}
                                >
                                    <div className={cn(
                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border transition-colors", 
                                        isSelected ? "bg-primary border-primary text-primary-foreground" : "border-primary/50 opacity-50 [&_svg]:invisible",
                                        option.disabled && !isSelected && "border-slate-300 bg-slate-200/50"
                                    )}>
                                        <Check className={cn("h-3 w-3")} />
                                    </div>
                                    <span className="truncate">{option.label}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}