'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PopulatedQuestion, PopulatedMedia, PopulatedAnswer } from '../lib/hydration-utils';
import { BookOpen, Edit3, MinusCircle, GripVertical, Target, BrainCircuit } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// --- STYLED SUB-COMPONENTS ---

const MediaGallery = ({ mediaList }: { mediaList?: PopulatedMedia[] }) => {
    if (!mediaList || mediaList.length === 0) return null;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
            {mediaList.map((media) => {
                const isImage = media.mimetype.startsWith('image/');
                const isAudio = media.mimetype.startsWith('audio/');
                return (
                    <div key={media._id} className="relative group bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden flex flex-col justify-center p-2">
                        {isImage && <img src={media.url} alt={media.originalName} loading="lazy" className="max-h-[200px] w-full object-contain rounded-lg mx-auto" />}
                        {isAudio && (
                            <div className="w-full px-3 py-2 flex flex-col items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 w-full text-left">Audio file</span>
                                <audio src={media.url} controls className="w-full h-8 outline-none" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// [CTO FIX]: Khử lỗi 0-width collapse bằng cách loại bỏ overflow-hidden và ép w-full
const AnswersBlock = ({ answers, correctAnswerId }: { answers?: PopulatedAnswer[], correctAnswerId?: string }) => {
    if (!answers || answers.length === 0) return null;
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 w-full">
            {answers.map((ans) => {
                const isCorrect = ans.id === correctAnswerId;
                return (
                    <div key={ans.id} className={cn(
                        "flex w-full border rounded-xl overflow-hidden transition-all shadow-sm",
                        isCorrect ? "bg-green-50 border-green-500" : "bg-white border-slate-200 hover:border-slate-300"
                    )}>
                        <div className={cn(
                            "flex items-center justify-center w-10 shrink-0 font-bold text-sm transition-colors",
                            isCorrect ? "bg-green-500 text-white" : "bg-slate-100 text-slate-500 border-r border-slate-200"
                        )}>
                            {ans.id}
                        </div>
                        
                        {/* Ép w-full cứng để không bị bóp dẹt text */}
                        <div className="flex-1 w-full p-3 min-w-0 flex items-center">
                             <div 
                                className={cn(
                                    "prose prose-sm max-w-none break-words [&>p]:m-0 leading-relaxed w-full",
                                    isCorrect ? "text-green-900 font-medium" : "text-slate-700"
                                )} 
                                dangerouslySetInnerHTML={{ __html: ans.content }} 
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const DifficultyBadge = ({ level }: { level?: string }) => {
    const config: Record<string, { label: string, color: string }> = {
        'NB': { label: 'Nhận biết', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        'TH': { label: 'Thông hiểu', color: 'bg-blue-50 text-blue-700 border-blue-200' },
        'VD': { label: 'Vận dụng', color: 'bg-amber-50 text-amber-700 border-amber-200' },
        'VDC': { label: 'Vận dụng cao', color: 'bg-purple-50 text-purple-700 border-purple-200' },
        'UNKNOWN': { label: 'Chưa phân loại', color: 'bg-slate-50 text-slate-500 border-slate-200' },
    };
    
    const current = config[level || 'UNKNOWN'] || config['UNKNOWN'];
    
    return (
        <div className={cn("flex justify-center items-center gap-1.5 px-3 py-2.5 rounded-lg border text-xs font-bold uppercase tracking-wider w-full shadow-sm", current.color)}>
            <BrainCircuit className="w-4 h-4 shrink-0" />
            <span className="truncate">{current.label}</span>
        </div>
    );
};

// --- MAIN CARD COMPONENT ---

type WorkspaceQuestion = PopulatedQuestion & { displayNumber?: number; processedSubQuestions?: any[]; points?: number };

interface SortableQuestionCardProps {
    question: WorkspaceQuestion;
    answerKeys: any[];
    isPublished: boolean;
    draftPoints: Record<string, number>;
    onPointChange: (id: string, points: number, originalPoints?: number) => void;
    onEdit: (q: PopulatedQuestion) => void;
    onRemove: (id: string) => void;
}

export const SortableQuestionCard = React.memo(({ question, answerKeys, isPublished, draftPoints, onPointChange, onEdit, onRemove }: SortableQuestionCardProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: question.originalQuestionId,
        disabled: isPublished
    });

    const style = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition: transition || undefined,
        zIndex: isDragging ? 50 : 1,
    };

    const isPassage = question.type === 'PASSAGE';
    const correctAnswerId = answerKeys.find(k => k.originalQuestionId === question.originalQuestionId)?.correctAnswerId;

    const renderBentoPointInput = (id: string, defaultPoints: number | undefined) => {
        const val = draftPoints[id] !== undefined ? draftPoints[id] : (defaultPoints ?? '');

        return (
            <div className="bg-white rounded-lg p-2.5 border border-slate-200 flex items-center justify-between w-full shadow-sm" onPointerDown={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1.5 text-slate-500 pl-1 shrink-0">
                    <Target className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Điểm</span>
                </div>
                <input
                    type="number" min="0" step="0.1" disabled={isPublished} placeholder="0.0"
                    className="w-16 h-8 text-sm font-black text-center text-primary bg-slate-50 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50 shrink-0"
                    value={val}
                    onChange={(e) => onPointChange(id, parseFloat(e.target.value), defaultPoints)}
                />
            </div>
        );
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative bg-white border border-border rounded-2xl p-4 md:p-5 transition-all shadow-sm hover:shadow-md",
                isPassage && "border-l-4 border-l-purple-500 bg-purple-50/20",
                isDragging && "opacity-95 ring-2 ring-primary shadow-2xl scale-[1.02]"
            )}
        >
            {/* [CTO FIX]: Kiến trúc CSS Grid bảo vệ 100% layout không bị xô lệch */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
                
                {/* CỘT TRÁI (Nội dung chính) - Cố định 8/12 hoặc 9/12 cột */}
                <div className="lg:col-span-8 xl:col-span-9 flex flex-col min-w-0 w-full">
                    <div className="flex gap-3">
                        {/* Drag Handle & Number Badge */}
                        <div className="flex flex-col items-center gap-1.5 shrink-0 mt-0.5">
                            {!isPublished && (
                                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-primary transition-colors p-1 rounded-md hover:bg-primary/10">
                                    <GripVertical className="w-5 h-5" />
                                </div>
                            )}
                            <div className={cn(
                                "w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shadow-sm text-white",
                                isPassage ? "bg-purple-600" : "bg-slate-800"
                            )}>
                                {isPassage ? <BookOpen className="w-4 h-4" /> : question.displayNumber}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden min-w-0 w-full">
                            {isPassage && (
                                <span className="text-[10px] font-bold uppercase text-purple-600 bg-purple-100 px-2 py-0.5 rounded inline-block mb-2 shadow-sm">
                                    Khối bài đọc
                                </span>
                            )}
                            <div className="prose prose-sm max-w-none text-slate-800 font-medium break-words [&>p]:m-0 leading-relaxed w-full" dangerouslySetInnerHTML={{ __html: question.content }} />
                            <MediaGallery mediaList={question.attachedMedia} />
                        </div>
                    </div>

                    {/* Sub-questions for Passage */}
                    {isPassage ? (
                        <div className="mt-4 md:ml-10 space-y-4 border-l-2 border-slate-100 pl-4 w-full">
                            {question.processedSubQuestions?.map((subQ, index) => {
                                const safeSubId = String(subQ.originalQuestionId || subQ._id || `sub-fallback-${index}`);
                                const subCorrectId = answerKeys.find(k => k.originalQuestionId === safeSubId)?.correctAnswerId;

                                return (
                                    <div key={safeSubId} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 xl:grid-cols-12 gap-4 w-full">
                                        <div className="xl:col-span-8 flex flex-col min-w-0 w-full">
                                            <div className="flex gap-3 w-full">
                                                <div className="w-6 h-6 shrink-0 bg-slate-100 text-slate-600 rounded flex items-center justify-center font-bold text-xs">
                                                    {subQ.displayNumber}
                                                </div>
                                                <div className="flex-1 min-w-0 w-full">
                                                    <div className="prose prose-sm max-w-none text-slate-700 break-words [&>p]:m-0 leading-relaxed w-full" dangerouslySetInnerHTML={{ __html: subQ.content }} />
                                                    <MediaGallery mediaList={subQ.attachedMedia} />
                                                    <AnswersBlock answers={subQ.answers} correctAnswerId={subCorrectId} />
                                                </div>
                                            </div>
                                        </div>
                                        {/* Sub-question Meta */}
                                        <div className="xl:col-span-4 flex flex-col gap-2 border-t xl:border-t-0 xl:border-l border-slate-100 pt-3 xl:pt-0 xl:pl-4 min-w-0 w-full">
                                            <DifficultyBadge level={subQ.difficultyLevel} />
                                            {renderBentoPointInput(safeSubId, subQ.points)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mt-4 md:ml-10 w-full min-w-0">
                            <AnswersBlock answers={question.answers} correctAnswerId={correctAnswerId} />
                        </div>
                    )}
                </div>

                {/* CỘT PHẢI (Meta Data & Actions) - Cố định ở một Box bên phải, h-fit để không bị kéo giãn theo cột trái */}
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100 min-w-0 w-full h-fit">
                    
                    {!isPassage ? (
                        <>
                            <DifficultyBadge level={question.difficultyLevel} />
                            {renderBentoPointInput(question.originalQuestionId, question.points)}
                        </>
                    ) : (
                         <div className="text-xs text-center text-slate-500 font-medium p-2 bg-white rounded-lg border border-slate-200 shadow-sm w-full">
                            <span className="block font-bold text-purple-600 mb-1">Cấu trúc đa phần</span>
                            Điểm & Độ khó gán tại câu con.
                         </div>
                    )}

                    {!isPublished && (
                        <div className="flex gap-2 mt-2 pt-3 border-t border-slate-200 w-full">
                            <button
                                onClick={() => onEdit(question)}
                                className="flex-1 flex justify-center items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg py-2.5 text-xs font-bold transition-colors shadow-sm"
                            >
                                <Edit3 className="w-3.5 h-3.5" /> Sửa
                            </button>
                            <button
                                onClick={() => onRemove(question.originalQuestionId)}
                                className="flex justify-center items-center bg-white hover:bg-red-50 text-red-500 border border-slate-200 hover:border-red-200 rounded-lg p-2.5 transition-colors shadow-sm"
                                title="Xóa"
                            >
                                <MinusCircle className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
SortableQuestionCard.displayName = 'SortableQuestionCard';