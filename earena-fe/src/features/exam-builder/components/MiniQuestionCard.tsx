'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { PopulatedQuestion } from '../lib/hydration-utils';
import { GripVertical, BookOpen, FileQuestion } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface MiniQuestionCardProps {
    question: PopulatedQuestion;
    isAlreadyAdded?: boolean;
}

// 1. Tách phần Giao diện (UI) thuần túy ra. Component này KHÔNG dùng hook của dnd-kit.
export const MiniQuestionCardUI = React.memo(({ question, isAlreadyAdded }: MiniQuestionCardProps) => {
    const isPassage = question.type === 'PASSAGE';

    return (
        <div
            className={cn(
                "p-3 rounded-xl border bg-white flex items-start gap-2 transition-all relative w-full",
                isAlreadyAdded ? "opacity-50 bg-slate-50 cursor-not-allowed border-slate-200" : "hover:border-blue-400 hover:shadow-md",
                !isAlreadyAdded && isPassage ? "border-purple-200" : "border-slate-200"
            )}
        >
            <div className="mt-1 text-slate-400 shrink-0 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                    {isPassage ? <BookOpen className="w-3.5 h-3.5 text-purple-600 shrink-0" /> : <FileQuestion className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-sm shrink-0",
                        isPassage ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    )}>
                        {question.difficultyLevel || 'UNKNOWN'}
                    </span>
                    {isPassage && (
                        <span className="text-[10px] text-purple-600 font-semibold truncate">
                            {question.subQuestions?.length || 0} câu phụ
                        </span>
                    )}
                </div>
                <div
                    className="text-xs text-slate-700 line-clamp-2 prose prose-sm prose-p:m-0 prose-p:inline font-medium leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: question.content }}
                />
                {isAlreadyAdded && (
                    <div className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-wider">
                        Đã có trong đề
                    </div>
                )}
            </div>
        </div>
    );
});
MiniQuestionCardUI.displayName = 'MiniQuestionCardUI';

// 2. Component bọc logic Draggable
export const MiniQuestionCard = React.memo(({ question, isAlreadyAdded }: MiniQuestionCardProps) => {
    const rawId = question.originalQuestionId || question._id || (question as any).id;

    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `bank-${rawId}`,
        data: {
            type: 'QuestionFromBank',
            questionData: question,
        },
        disabled: isAlreadyAdded,
    });

    // Khi đang kéo, thay vì di chuyển cục gốc (gây lỗi với Overlay), ta trả về một khung mờ (Placeholder)
    if (isDragging) {
        return (
            <div ref={setNodeRef} className="h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/50 opacity-50" />
        );
    }

    return (
        <div ref={setNodeRef} {...attributes} {...listeners} className="touch-none">
            <MiniQuestionCardUI question={question} isAlreadyAdded={isAlreadyAdded} />
        </div>
    );
});
MiniQuestionCard.displayName = 'MiniQuestionCard';