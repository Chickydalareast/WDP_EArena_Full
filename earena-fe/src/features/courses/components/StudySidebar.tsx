'use client';

import { usePathname, useRouter } from 'next/navigation';
import { SectionPreview, LessonPreview } from '../types/course.schema';
import { CheckCircle2, PlayCircle, FileText, HelpCircle, Lock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useState } from 'react';

interface StudySidebarProps {
  sections: SectionPreview[];
  currentLessonId: string | null;
  treeStatus?: 'ACTIVE' | 'EXPIRED' | 'BANNED' | string; 
}

type LessonWithFallback = LessonPreview & {
  primaryVideoId?: string;
  mediaId?: string;
};

export function StudySidebar({ sections, currentLessonId, treeStatus = 'ACTIVE' }: StudySidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    sections.forEach(sec => {
      initialState[sec.id] = sec.lessons.some(l => l.id === currentLessonId) || true;
    });
    return initialState;
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const onLessonSelect = (lessonId: string, isFreePreview: boolean) => {
    router.push(`${pathname}?lessonId=${lessonId}`, { scroll: false });
  };

  const getIcon = (lesson: LessonWithFallback) => {
    if (lesson.examId) return <HelpCircle className="w-4 h-4" />;
    if (lesson.primaryVideo || lesson.primaryVideoId || lesson.mediaId) return <PlayCircle className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getLabel = (lesson: LessonWithFallback) => {
    if (lesson.examId) return 'Bài tập';
    if (lesson.primaryVideo || lesson.primaryVideoId || lesson.mediaId) return 'Video';
    return 'Lý thuyết';
  };

  return (
    <div className="flex flex-col w-full">
      {sections.map((section, index) => (
        <div key={section.id} className="border-b border-border">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between p-4 bg-muted/10 hover:bg-muted/30 transition-colors text-left"
          >
            <span className="font-bold text-sm text-foreground">
              Phần {index + 1}: {section.title}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {section.lessons.filter(l => l.isCompleted).length}/{section.lessons.length}
            </span>
          </button>

          {openSections[section.id] && (
            <div className="flex flex-col py-1">
              {section.lessons.map((lesson) => {
                const isActive = lesson.id === currentLessonId;
                
                return (
                  <button
                    key={lesson.id}
                    onClick={() => onLessonSelect(lesson.id, lesson.isFreePreview)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-left transition-colors relative group outline-none",
                      isActive ? "bg-primary/10" : "hover:bg-muted/50"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md" />
                    )}
                    
                    {lesson.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-muted-foreground/40 shrink-0 flex items-center justify-center">
                         {treeStatus !== 'ACTIVE' && !lesson.isFreePreview && <Lock className="w-3 h-3 text-muted-foreground/40" />}
                      </div>
                    )}

                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className={cn(
                        "text-sm font-medium truncate",
                        isActive ? "text-primary" : "text-foreground group-hover:text-primary"
                      )}>
                        {lesson.title}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                        {getIcon(lesson)}
                        <span>{getLabel(lesson)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}