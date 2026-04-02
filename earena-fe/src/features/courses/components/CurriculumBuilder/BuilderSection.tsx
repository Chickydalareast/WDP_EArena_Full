'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SectionPreview, LessonPreview } from '../../types/course.schema';
import { GripVertical, Plus, Edit2, Trash2, Lock } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { BuilderLesson } from './BuilderLesson';

interface BuilderSectionProps {
  section: SectionPreview;
  isTotalLocked: boolean;     // Khóa do đang duyệt
  isStructureLocked: boolean; // Khóa xóa do có học sinh
  isModeLocked: boolean;      // Khóa kéo thả do học tuần tự
  onAddLesson: (sectionId: string) => void;
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
    <div ref={setNodeRef} style={style} className="bg-background border border-border rounded-lg shadow-sm overflow-hidden group/section">
      <div className="flex items-center justify-between p-3 bg-muted/20 border-b border-border">
        <div className="flex items-center gap-3 w-full">
          {/* Nút Drag với Tooltip Cảnh báo Mode Lock */}
          <div className="relative group/drag flex items-center">
            <button
              className={cn(
                "p-1.5 rounded outline-none transition-colors",
                isDragDisabled ? "cursor-not-allowed opacity-30" : "cursor-grab active:cursor-grabbing text-muted-foreground hover:bg-muted focus:ring-2 ring-primary"
              )}
              disabled={isDragDisabled}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-5 h-5" />
            </button>
            {isModeLocked && !isTotalLocked && (
              <div className="absolute left-full ml-2 hidden group-hover/drag:block w-48 bg-foreground text-background text-xs py-1.5 px-2 rounded z-50 shadow-lg pointer-events-none">
                Đã khóa Kéo thả do chế độ học Tuần tự đang bật.
              </div>
            )}
          </div>

          <h3 className="font-semibold text-foreground flex-1">{section.title}</h3>

          <button
            onClick={() => onEditSection(section)}
            disabled={isTotalLocked}
            className={cn("p-1.5 rounded transition-colors", isTotalLocked ? "opacity-30 cursor-not-allowed" : "text-muted-foreground hover:text-primary hover:bg-primary/10")}
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <div className="relative group/trash flex items-center">
            <button
              onClick={() => onDeleteTrigger('SECTION', section.id, section.title)}
              disabled={isDeleteDisabled}
              className={cn("p-1.5 rounded transition-colors", isDeleteDisabled ? "opacity-30 cursor-not-allowed" : "text-muted-foreground hover:text-destructive hover:bg-destructive/10")}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {isDeleteDisabled && !isTotalLocked && (
              <div className="absolute right-0 bottom-full mb-2 hidden group-hover/trash:block w-48 bg-foreground text-background text-xs text-center py-1.5 px-2 rounded z-50 shadow-lg pointer-events-none">
                Không thể xóa Chương khi đã có học sinh ghi danh
              </div>
            )}
          </div>
        </div>

        <Button
          size="sm"
          variant="ghost"
          className={cn("h-8 ml-4 shrink-0 hover:bg-primary/10 hover:text-primary", isTotalLocked && "opacity-50")}
          onClick={() => onAddLesson(section.id)}
          disabled={isTotalLocked}
        >
          <Plus className="w-4 h-4 mr-1" /> Thêm bài học
        </Button>
      </div>

      <div className="p-3 space-y-2">
        {section.lessons.length === 0 ? (
          <p className="text-sm text-muted-foreground italic px-8 py-2">Chưa có bài học nào.</p>
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