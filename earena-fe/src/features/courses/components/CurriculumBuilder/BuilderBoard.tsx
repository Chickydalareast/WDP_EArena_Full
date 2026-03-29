'use client';

import { useState, useEffect } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useCurriculumTree, useReorderCurriculum } from '../../hooks/useCurriculumBuilder';
import { buildReorderPayload } from '../../lib/curriculum-utils';
import { SectionPreview, LessonPreview } from '../../types/course.schema';
import { BuilderSection } from './BuilderSection';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Button } from '@/shared/components/ui/button';
import { PlusCircle, Save, Loader2, Sparkles } from 'lucide-react';

import { CreateSectionModal } from './CreateSectionModal';
import { CreateLessonModal } from './CreateLessonModal';
import { EditSectionModal } from './EditSectionModal';
import { EditLessonModal } from './EditLessonModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { AiCourseBuilderModal } from './AiCourseBuilderModal';

export function BuilderBoard({ courseId }: { courseId: string }) {
  const { data, isLoading } = useCurriculumTree(courseId);
  const { mutate: reorderCurriculum, isPending: isSaving } = useReorderCurriculum(courseId);

  const [localSections, setLocalSections] = useState<SectionPreview[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  
  const [activeSectionIdForLesson, setActiveSectionIdForLesson] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<SectionPreview | null>(null);

  const [editingLesson, setEditingLesson] = useState<{ lesson: LessonPreview; sectionId: string } | null>(null);

  const [deleteConfig, setDeleteConfig] = useState<{ type: 'SECTION' | 'LESSON'; id: string; name: string; sectionId?: string } | null>(null);

  useEffect(() => {
    if (data?.curriculum?.sections && !isDirty) {
      setLocalSections(data.curriculum.sections);
    }
  }, [data, isDirty]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalSections((sections) => {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        setIsDirty(true);
        return arrayMove(sections, oldIndex, newIndex);
      }
      return sections;
    });
  };

  const handleSaveStructure = () => {
    const payload = buildReorderPayload(localSections);
    reorderCurriculum(payload, {
      onSuccess: () => setIsDirty(false)
    });
  };

  if (isLoading) return <Skeleton className="w-full h-[400px] rounded-xl" />;

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold">Cấu trúc khóa học</h2>
          <span className="text-sm text-muted-foreground">Kéo thả biểu tượng dọc để thay đổi vị trí. Nhớ bấm Lưu!</span>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <Button onClick={handleSaveStructure} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white rounded-full">
              {isSaving ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Save className="mr-2 w-4 h-4" />}
              {isSaving ? 'Đang lưu...' : 'Lưu Cấu Trúc'}
            </Button>
          )}

          <Button 
            onClick={() => setIsAiModalOpen(true)} 
            className="rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200"
          >
            <Sparkles className="mr-2 w-4 h-4" /> AI Builder
          </Button>

          <Button onClick={() => setIsSectionModalOpen(true)} className="rounded-full" variant={isDirty ? 'outline' : 'default'}>
            <PlusCircle className="mr-2 w-4 h-4" /> Thêm Chương
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={localSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {localSections.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-border rounded-lg bg-muted/20">
                <p className="text-muted-foreground">Chưa có chương học nào. Bắt đầu bằng cách tạo chương mới!</p>
              </div>
            ) : (
              localSections.map((section) => (
                <BuilderSection
                  key={section.id}
                  section={section}
                  onAddLesson={(sectionId) => setActiveSectionIdForLesson(sectionId)}
                  onEditSection={(sec) => setEditingSection(sec)}
                  onEditLesson={(les) => setEditingLesson({ lesson: les, sectionId: section.id })}
                  onDeleteTrigger={(type, id, title, parentId) => setDeleteConfig({ type, id, name: title, sectionId: parentId })}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      <CreateSectionModal courseId={courseId} isOpen={isSectionModalOpen} onClose={() => setIsSectionModalOpen(false)} />
      <CreateLessonModal courseId={courseId} sectionId={activeSectionIdForLesson || ''} isOpen={!!activeSectionIdForLesson} onClose={() => setActiveSectionIdForLesson(null)} />

      <EditSectionModal courseId={courseId} section={editingSection} onClose={() => setEditingSection(null)} />
      <EditLessonModal courseId={courseId} lessonData={editingLesson} onClose={() => setEditingLesson(null)} />

      {deleteConfig && <ConfirmDeleteModal courseId={courseId} isOpen={!!deleteConfig} config={deleteConfig} onClose={() => setDeleteConfig(null)} />}
      
      <AiCourseBuilderModal 
        courseId={courseId} 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
      />
    </div>
  );
}