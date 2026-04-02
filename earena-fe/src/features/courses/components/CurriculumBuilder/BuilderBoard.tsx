'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useCurriculumTree, useReorderCurriculum } from '../../hooks/useCurriculumBuilder';
import { useCourseSettings, useCourseDashboardStats } from '../../hooks/useCourseSettings';
import { buildReorderPayload } from '../../lib/curriculum-utils';
import { SectionPreview, LessonPreview, CourseStatus } from '../../types/course.schema';

import { BuilderSection } from './BuilderSection';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Button } from '@/shared/components/ui/button';
import { PlusCircle, Save, Loader2, Sparkles, AlertCircle, Lock } from 'lucide-react';

import { CreateSectionModal } from './CreateSectionModal';
import { CreateLessonModal } from './CreateLessonModal';
import { EditSectionModal } from './EditSectionModal';
import { EditLessonModal } from './EditLessonModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { AiCourseBuilderModal } from './AiCourseBuilderModal';

export function BuilderBoard({ courseId }: { courseId: string }) {
  const { data: treeData, isLoading: isTreeLoading } = useCurriculumTree(courseId);
  const { data: course, isLoading: isCourseLoading } = useCourseSettings(courseId);
  const { data: stats, isLoading: isStatsLoading } = useCourseDashboardStats(courseId);
  
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
    if (treeData?.curriculum?.sections && !isDirty) {
      setLocalSections(treeData.curriculum.sections);
    }
  }, [treeData, isDirty]);

  const isStatusLocked = course?.status === CourseStatus.PENDING_REVIEW;
  const totalStudents = stats?.totalStudents || 0;
  
  const isStructureLocked = totalStudents > 0;
  const isModeLocked = totalStudents > 0 && course?.progressionMode === 'STRICT_LINEAR';

  const isTotalLocked = isStatusLocked;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (isTotalLocked || isModeLocked) return; // Bảo mật 2 lớp

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
    reorderCurriculum(payload, { onSuccess: () => setIsDirty(false) });
  };

  const isPageLoading = isTreeLoading || isCourseLoading || isStatsLoading;
  if (isPageLoading) return <Skeleton className="w-full h-[500px] rounded-xl" />;

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
      
      {/* Banner Cảnh báo Khóa Status */}
      {isStatusLocked && (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex items-start gap-3 text-yellow-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Khóa học đang được kiểm duyệt</h4>
            <p className="text-xs mt-1">Hệ thống đã khóa tính năng sửa đổi giáo án để đảm bảo tính toàn vẹn dữ liệu.</p>
          </div>
        </div>
      )}

      {/* Banner Cảnh báo Khóa Cấu Trúc */}
      {!isStatusLocked && totalStudents > 0 && (
        <div className="mb-6 bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-start gap-3 text-foreground">
          <Lock className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
          <div>
            <h4 className="font-bold text-sm text-primary">Đã kích hoạt Chế độ Bảo vệ Tiến độ</h4>
            <p className="text-xs mt-1 text-muted-foreground">
              Khóa học đã có <strong className="text-primary">{totalStudents}</strong> học sinh. Tính năng Xóa phân mảnh đã bị khóa. 
              {isModeLocked && " Chức năng kéo thả cũng bị khóa do bạn đang chọn chế độ học Tuần tự."}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold">Cấu trúc khóa học</h2>
          <span className="text-sm text-muted-foreground">Xây dựng lộ trình học tập cho học viên.</span>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && !isTotalLocked && !isModeLocked && (
            <Button onClick={handleSaveStructure} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white rounded-full">
              {isSaving ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Save className="mr-2 w-4 h-4" />}
              {isSaving ? 'Đang lưu...' : 'Lưu Cấu Trúc'}
            </Button>
          )}

          <Button 
            onClick={() => setIsAiModalOpen(true)} 
            disabled={isTotalLocked}
            className="rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200 disabled:opacity-50"
          >
            <Sparkles className="mr-2 w-4 h-4" /> AI Builder
          </Button>

          <Button 
            onClick={() => setIsSectionModalOpen(true)} 
            disabled={isTotalLocked}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50" 
            variant={isDirty ? 'outline' : 'default'}
          >
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
                  isTotalLocked={isTotalLocked}
                  isStructureLocked={isStructureLocked}
                  isModeLocked={isModeLocked}
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
      <AiCourseBuilderModal courseId={courseId} isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
    </div>
  );
}