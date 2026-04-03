'use client';

import { LessonPreview } from '../../types/course.schema';
import { GripVertical, PlayCircle, FileText, HelpCircle, Edit2, Trash2, Zap } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface BuilderLessonProps {
    lesson: LessonPreview;
    sectionId: string;
    isTotalLocked: boolean;
    isStructureLocked: boolean;
    onEdit: (lesson: LessonPreview) => void;
    onDelete: (type: 'LESSON', id: string, title: string, parentId: string) => void;
}

export function BuilderLesson({
    lesson,
    sectionId,
    isTotalLocked,
    isStructureLocked,
    onEdit,
    onDelete,
}: BuilderLessonProps) {

    const getIcon = () => {
        if (lesson.examId) {
            if (lesson.examMode === 'DYNAMIC') {
                return <Zap className="w-4 h-4 text-purple-600 shrink-0 fill-purple-100" />;
            }
            return <HelpCircle className="w-4 h-4 text-purple-500 shrink-0" />;
        }
        if (lesson.primaryVideo) return <PlayCircle className="w-4 h-4 text-blue-500 shrink-0" />;
        return <FileText className="w-4 h-4 text-orange-500 shrink-0" />;
    };

    const formatDate = (isoString?: string) => {
        if (!isoString) return '';
        return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(isoString));
    };

    const isDeleteDisabled = isTotalLocked || isStructureLocked;

    return (
        <div className="flex items-center justify-between p-3 bg-white border border-border rounded-md ml-8 hover:border-primary/50 transition-colors group/lesson shadow-sm">
            <div className="flex items-center gap-3 w-full">
                <div className="relative group/drag cursor-not-allowed">
                    <GripVertical className="w-4 h-4 text-muted-foreground/30" />
                </div>

                {getIcon()}

                <div className="flex flex-col flex-1 truncate">
                    <span className="text-sm font-semibold truncate text-slate-700">{lesson.title}</span>
                    {lesson.updatedAt && (
                        <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">Cập nhật: {formatDate(lesson.updatedAt)}</span>
                    )}
                </div>

                <button
                    onClick={() => onEdit(lesson)}
                    disabled={isTotalLocked}
                    className={cn("p-1.5 ml-2 rounded transition-colors", isTotalLocked ? "opacity-30 cursor-not-allowed" : "text-muted-foreground hover:text-blue-600 hover:bg-blue-50")}
                >
                    <Edit2 className="w-4 h-4" />
                </button>

                <div className="relative group/trash flex items-center">
                    <button
                        onClick={() => onDelete('LESSON', lesson.id, lesson.title, sectionId)}
                        disabled={isDeleteDisabled}
                        className={cn("p-1.5 rounded transition-colors", isDeleteDisabled ? "opacity-30 cursor-not-allowed" : "text-muted-foreground hover:text-red-600 hover:bg-red-50")}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {lesson.isFreePreview && (
                <span className="ml-3 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase shrink-0">
                    Free
                </span>
            )}
        </div>
    );
}