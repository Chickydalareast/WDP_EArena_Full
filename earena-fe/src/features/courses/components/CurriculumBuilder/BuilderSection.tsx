'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SectionPreview, LessonPreview } from '../../types/course.schema';
import { GripVertical, Plus, Edit2, Trash2, Zap, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { BuilderLesson } from './BuilderLesson';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';

interface BuilderSectionProps {
  section: SectionPreview;
  isTotalLocked: boolean;
  isStructureLocked: boolean;
  isModeLocked: boolean;
  // [CTO FIX]: Update type signature cho hàm callback
  onAddLesson: (sectionId: string, type: 'STATIC' | 'DYNAMIC') => void;
  onEditSection: (section: SectionPreview) => void;
  onDeleteTrigger: (type: 'SECTION' | 'LESSON', id: string, title: string, parentId?: string) => void;
  onEditLesson: (lesson: LessonPreview) => void;
}

export function BuilderSection({
  section,
  isTotalLocked,
  isStructureLocked,
  isModeLocked,
  onAddLesson,
  onEditSection,
  onDeleteTrigger,
  onEditLesson
}: BuilderSectionProps) {

  const isDragDisabled = isTotalLocked || isModeLocked;
  const isDeleteDisabled = isTotalLocked || isStructureLocked;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    disabled: isDragDisabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-slate-50 border border-border rounded-xl shadow-sm overflow-hidden group/section">
      <div className="flex items-center justify-between p-3 bg-white border-b border-border shadow-sm relative z-10">
        <div className="flex items-center gap-3 w-full">
          <div className="relative group/drag flex items-center">
            <button
              className={cn(
                "p-1.5 rounded outline-none transition-colors",
                isDragDisabled ? "cursor-not-allowed opacity-30" : "cursor-grab active:cursor-grabbing text-muted-foreground hover:bg-slate-100"
              )}
              disabled={isDragDisabled}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-5 h-5" />
            </button>
          </div>

          <h3 className="font-bold text-slate-800 flex-1 text-base">{section.title}</h3>

          <button
            onClick={() => onEditSection(section)}
            disabled={isTotalLocked}
            className={cn("p-1.5 rounded transition-colors", isTotalLocked ? "opacity-30 cursor-not-allowed" : "text-muted-foreground hover:text-blue-600 hover:bg-blue-50")}
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <div className="relative group/trash flex items-center">
            <button
              onClick={() => onDeleteTrigger('SECTION', section.id, section.title)}
              disabled={isDeleteDisabled}
              className={cn("p-1.5 rounded transition-colors", isDeleteDisabled ? "opacity-30 cursor-not-allowed" : "text-muted-foreground hover:text-red-600 hover:bg-red-50")}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* [CTO UPDATE]: Xổ ra Dropdown thay vì nút bấm thường */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className={cn("h-8 ml-4 shrink-0 bg-white border-slate-200 text-slate-700 font-bold", isTotalLocked && "opacity-50")}
              disabled={isTotalLocked}
            >
              <Plus className="w-4 h-4 mr-1 text-slate-500" /> Thêm Bài
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
            <DropdownMenuItem
              onClick={() => onAddLesson(section.id, 'STATIC')}
              className="py-2.5 px-3 cursor-pointer font-medium text-slate-700 focus:bg-blue-50 focus:text-blue-700 rounded-lg"
            >
              <FileText className="w-4 h-4 mr-2 text-blue-500" /> Bài Học (Video/PDF/Đề Tĩnh)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAddLesson(section.id, 'DYNAMIC')}
              className="py-2.5 px-3 cursor-pointer font-bold text-purple-700 focus:bg-purple-50 focus:text-purple-800 rounded-lg"
            >
              <Zap className="w-4 h-4 mr-2 fill-purple-200" /> Đề Thi Động (Rules)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>

      <div className="p-3 space-y-2">
        {section.lessons.length === 0 ? (
          <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg bg-white">
            <p className="text-xs text-muted-foreground font-medium">Chưa có bài học nào trong chương này.</p>
          </div>
        ) : (
          section.lessons.map((lesson) => (
            <BuilderLesson
              key={lesson.id}
              lesson={lesson}
              sectionId={section.id}
              isTotalLocked={isTotalLocked}
              isStructureLocked={isStructureLocked}
              onEdit={onEditLesson}
              onDelete={onDeleteTrigger}
            />
          ))
        )}
      </div>
    </div>
  );
}