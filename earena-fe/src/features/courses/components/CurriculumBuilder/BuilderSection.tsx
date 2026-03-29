'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SectionPreview, LessonPreview } from '../../types/course.schema';
import { GripVertical, Plus, PlayCircle, FileText, HelpCircle, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils'; // Dùng tailwind-merge để mix class

interface BuilderSectionProps {
  section: SectionPreview;
  isLocked?: boolean; // [CTO BỔ SUNG]: Khai báo type chặt chẽ
  onAddLesson: (sectionId: string) => void;
  onEditSection: (section: SectionPreview) => void;
  onDeleteTrigger: (type: 'SECTION' | 'LESSON', id: string, title: string, parentId?: string) => void;
  onEditLesson: (lesson: LessonPreview) => void;
}

export function BuilderSection({
  section,
  isLocked = false,
  onAddLesson,
  onEditSection,
  onDeleteTrigger,
  onEditLesson
}: BuilderSectionProps) {
  
  // [CTO UPGRADE]: Khóa hoàn toàn hành vi kéo thả từ core của dnd-kit
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: section.id,
    disabled: isLocked 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const getIcon = (lesson: LessonPreview) => {
    if (lesson.examId) return <HelpCircle className="w-4 h-4 text-purple-500" />;
    if (lesson.primaryVideo) return <PlayCircle className="w-4 h-4 text-blue-500" />;
    return <FileText className="w-4 h-4 text-orange-500" />;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    return new Intl.DateTimeFormat('vi-VN', { 
        day: '2-digit', month: '2-digit', year: 'numeric' 
    }).format(new Date(isoString));
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-muted/20 border-b border-border">
        <div className="flex items-center gap-3">
          <button 
            className={cn(
              "p-1.5 rounded outline-none focus:ring-2 ring-primary transition-colors",
              isLocked ? "cursor-not-allowed opacity-30" : "cursor-grab active:cursor-grabbing text-muted-foreground hover:bg-muted"
            )}
            disabled={isLocked}
            {...attributes} 
            {...listeners}
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-foreground">{section.title}</h3>

          <button 
            onClick={() => onEditSection(section)} 
            disabled={isLocked}
            className={cn("p-1 transition-colors", isLocked ? "opacity-30 cursor-not-allowed" : "text-muted-foreground hover:text-primary")}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDeleteTrigger('SECTION', section.id, section.title)} 
            disabled={isLocked}
            className={cn("p-1 transition-colors", isLocked ? "opacity-30 cursor-not-allowed" : "text-muted-foreground hover:text-red-500")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8" 
          onClick={() => onAddLesson(section.id)}
          disabled={isLocked}
        >
          <Plus className="w-4 h-4 mr-1" /> Thêm bài học
        </Button>
      </div>

      <div className="p-3 space-y-2">
        {section.lessons.length === 0 ? (
          <p className="text-sm text-muted-foreground italic px-8 py-2">Chưa có bài học nào.</p>
        ) : (
          section.lessons.map((lesson) => (
            <div key={lesson.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-md ml-8 hover:border-primary transition-colors">
              <div className="flex items-center gap-3">
                {/* Ở Level bài học ta đang disable Kéo thả (chờ update phase sau) nên luôn fix UI */}
                <GripVertical className="w-4 h-4 text-muted-foreground/30 cursor-not-allowed" title="Tính năng kéo bài học đang phát triển" />
                {getIcon(lesson)}
                
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{lesson.title}</span>
                  {lesson.updatedAt && (
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      Cập nhật: {formatDate(lesson.updatedAt)}
                    </span>
                  )}
                </div>

                <button 
                  onClick={() => onEditLesson(lesson)} 
                  disabled={isLocked}
                  className={cn("p-1 ml-2 transition-colors", isLocked ? "opacity-30 cursor-not-allowed" : "text-muted-foreground hover:text-primary")}
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => onDeleteTrigger('LESSON', lesson.id, lesson.title, section.id)} 
                  disabled={isLocked}
                  className={cn("p-1 transition-colors", isLocked ? "opacity-30 cursor-not-allowed" : "text-muted-foreground hover:text-red-500")}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {lesson.isFreePreview && (
                <span className="text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded uppercase">
                  Free
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}