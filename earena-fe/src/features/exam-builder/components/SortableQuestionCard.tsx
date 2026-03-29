'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PopulatedQuestion, PopulatedMedia } from '../lib/hydration-utils';
import { BookOpen, Edit3, MinusCircle, GripVertical } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// --- TÁI SỬ DỤNG LẠI CÁC SUB-COMPONENT TRỰC QUAN ---
const MediaGallery = ({ mediaList }: { mediaList?: PopulatedMedia[] }) => {
    if (!mediaList || mediaList.length === 0) return null;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 p-4 bg-slate-50/80 border border-slate-100 rounded-xl">
            {mediaList.map((media) => {
                const isImage = media.mimetype.startsWith('image/');
                const isAudio = media.mimetype.startsWith('audio/');
                return (
                    <div key={media._id} className="relative group bg-white overflow-hidden rounded-xl border shadow-sm flex flex-col justify-center p-2">
                        {isImage && <img src={media.url} alt={media.originalName} loading="lazy" className="max-h-[250px] w-full object-contain rounded-lg mx-auto" />}
                        {isAudio && (
                            <div className="w-full px-4 py-3 flex flex-col items-center">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 w-full text-left">Bài Nghe (Audio)</span>
                                <audio src={media.url} controls className="w-full h-10 outline-none" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const AnswersBlock = ({ answers, correctAnswerId }: { answers?: any[], correctAnswerId?: string }) => {
    if (!answers || answers.length === 0) return null;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {answers.map((ans) => {
                const isCorrect = ans.id === correctAnswerId;
                return (
                    <div key={ans.id} className={cn(
                        "flex items-center p-3 border rounded-xl text-sm transition-colors",
                        isCorrect ? "bg-green-50 border-green-500 text-green-800 font-bold shadow-sm" : "bg-slate-50 border-slate-200 text-slate-700"
                    )}>
                        <span className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center mr-3 text-[10px] font-bold shrink-0",
                            isCorrect ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"
                        )}>{ans.id}</span>
                        <span className="break-words">{ans.content}</span>
                    </div>
                );
            })}
        </div>
    );
};

// --- COMPONENT CHÍNH ---
interface SortableQuestionCardProps {
    question: PopulatedQuestion & { displayNumber?: number; processedSubQuestions?: any[] };
    answerKeys: any[];
    isPublished: boolean;
    onEdit: (q: PopulatedQuestion) => void;
    onRemove: (id: string) => void;
}

export const SortableQuestionCard = React.memo(({ question, answerKeys, isPublished, onEdit, onRemove }: SortableQuestionCardProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: question.originalQuestionId,
        disabled: isPublished // Chốt đề thì cấm kéo thả
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
    };

    const isPassage = question.type === 'PASSAGE';
    const correctAnswerId = answerKeys.find(k => k.originalQuestionId === question.originalQuestionId)?.correctAnswerId;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group bg-white border-2 rounded-2xl p-6 shadow-sm transition-all relative flex gap-4",
                isPassage ? "border-purple-200 bg-purple-50/10" : "border-slate-100",
                isDragging && "opacity-60 ring-4 ring-blue-500 shadow-2xl scale-[1.02]"
            )}
        >
            {/* Nút Cầm Nắm (Drag Handle) */}
            {!isPublished && (
                <div
                    {...attributes}
                    {...listeners}
                    className="w-6 h-full min-h-[100px] flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-blue-500 rounded bg-slate-50 hover:bg-blue-50 transition-colors shrink-0"
                >
                    <GripVertical className="w-5 h-5" />
                </div>
            )}

            {/* Nội dung câu hỏi */}
            <div className="flex-1 relative min-w-0">
                {!isPassage ? (
                    <div className="absolute -left-3 -top-3 w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold shadow-lg z-10">
                        {question.displayNumber}
                    </div>
                ) : (
                    <div className="absolute -left-3 -top-3 w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold shadow-lg z-10">
                        <BookOpen className="w-4 h-4" />
                    </div>
                )}

                {isPassage && (
                    <span className="text-[11px] font-black uppercase text-purple-700 bg-purple-100 px-3 py-1 rounded-md mb-4 inline-block tracking-wider border border-purple-200 shadow-sm mt-3">
                        Khối Bài Đọc
                    </span>
                )}

                <div className="prose prose-sm max-w-none text-slate-800 font-medium text-[15px] mb-2 mt-2" dangerouslySetInnerHTML={{ __html: question.content }} />
                <MediaGallery mediaList={question.attachedMedia} />

                {isPassage ? (
                    <div className="mt-8 space-y-6 pl-4 border-l-2 border-purple-200 relative">
                        {/* [CTO BỔ SUNG]: Thêm tham số index vào map */}
                        {question.processedSubQuestions?.map((subQ, index) => {
                            
                            const safeSubId = String(subQ.originalQuestionId || subQ._id || `sub-fallback-${index}`);
                            const safeParentId = String(question.originalQuestionId || question._id || 'parent-fallback');
                            
                            const compositeKey = `${safeParentId}-${safeSubId}`;

                            const subCorrectId = answerKeys.find(k => k.originalQuestionId === safeSubId)?.correctAnswerId;

                            return (
                                <div key={compositeKey} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
                                    <div className="absolute -left-4 top-4 w-7 h-7 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">
                                        {subQ.displayNumber}
                                    </div>
                                    <div className="ml-4">
                                        <div className="prose prose-sm max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: subQ.content }} />
                                        <MediaGallery mediaList={subQ.attachedMedia} />
                                        <AnswersBlock answers={subQ.answers} correctAnswerId={subCorrectId} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <AnswersBlock answers={question.answers} correctAnswerId={correctAnswerId} />
                )}

                {/* CÁC NÚT ACTION (Đã an toàn vì Drag Handle được tách riêng) */}
                {!isPublished && (
                    <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20 bg-white/80 p-1 rounded-bl-lg">
                        <button
                            onClick={() => onEdit(question)}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                        >
                            <Edit3 className="w-4 h-4" /> Sửa
                        </button>
                        <button
                            onClick={() => onRemove(question.originalQuestionId)}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                        >
                            <MinusCircle className="w-4 h-4" /> Rút
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});
SortableQuestionCard.displayName = 'SortableQuestionCard';