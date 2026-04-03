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
import { CreateDynamicQuizModal } from './CreateDynamicQuizModal';
import { EditDynamicQuizModal } from './EditDynamicQuizModal';

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
  const [activeSectionIdForDynamic, setActiveSectionIdForDynamic] = useState<string | null>(null);

  const [editingSection, setEditingSection] = useState<SectionPreview | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ lesson: LessonPreview; sectionId: string } | null>(null);
  const [editingDynamicLesson, setEditingDynamicLesson] = useState<{ lessonId: string } | null>(null);

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
    if (isTotalLocked || isModeLocked) return;
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

  const handleAddLesson = (sectionId: string, type: 'STATIC' | 'DYNAMIC') => {
    if (type === 'DYNAMIC') setActiveSectionIdForDynamic(sectionId);
    else setActiveSectionIdForLesson(sectionId);
  };

  const handleEditLesson = (lesson: LessonPreview, sectionId: string) => {
    if (lesson.examMode === 'DYNAMIC') {
      setEditingDynamicLesson({ lessonId: lesson.id });
    } else {
      setEditingLesson({ lesson, sectionId });
    }
  };

  const isPageLoading = isTreeLoading || isCourseLoading || isStatsLoading;
  if (isPageLoading) return <Skeleton className="w-full h-[500px] rounded-xl" />;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">

      {/* Banner Cảnh báo */}
      {isStatusLocked && (
        <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-800">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
          <div>
            <h4 className="font-bold text-sm">Khóa học đang được kiểm duyệt</h4>
            <p className="text-xs mt-1 font-medium">Hệ thống đã khóa tính năng sửa đổi giáo án để đảm bảo tính toàn vẹn dữ liệu.</p>
          </div>
        </div>
      )}

      {!isStatusLocked && totalStudents > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3 text-slate-800">
          <Lock className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
          <div>
            <h4 className="font-bold text-sm text-blue-800">Đã kích hoạt Chế độ Bảo vệ Tiến độ</h4>
            <p className="text-xs mt-1 font-medium text-slate-600">
              Khóa học đã có <strong className="text-blue-600">{totalStudents}</strong> học sinh. Tính năng Xóa phân mảnh bị khóa.
              {isModeLocked && " Chức năng kéo thả bị khóa do đang bật chế độ học Tuần tự."}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Cấu trúc khóa học</h2>
          <span className="text-sm font-medium text-slate-500">Xây dựng lộ trình học tập cho học viên.</span>
        </div>

        <div className="flex items-center gap-3">
          {isDirty && !isTotalLocked && !isModeLocked && (
            <Button onClick={handleSaveStructure} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm">
              {isSaving ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Save className="mr-2 w-4 h-4" />}
              {isSaving ? 'Đang lưu...' : 'Lưu Thứ Tự'}
            </Button>
          )}

          <Button
            onClick={() => setIsAiModalOpen(true)}
            disabled={isTotalLocked}
            className="rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-bold shadow-sm disabled:opacity-50"
          >
            <Sparkles className="mr-2 w-4 h-4" /> AI Builder
          </Button>

          <Button
            onClick={() => setIsSectionModalOpen(true)}
            disabled={isTotalLocked}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold shadow-sm disabled:opacity-50"
          >
            <PlusCircle className="mr-2 w-4 h-4" /> Thêm Chương
          </Button>
        </div>
      </div>

      {/* Drag & Drop Board */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={localSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {localSections.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <p className="text-slate-500 font-medium">Chưa có chương học nào. Bắt đầu bằng cách tạo chương mới!</p>
              </div>
            ) : (
              localSections.map((section) => (
                <BuilderSection
                  key={section.id}
                  section={section}
                  isTotalLocked={isTotalLocked}
                  isStructureLocked={isStructureLocked}
                  isModeLocked={isModeLocked}
                  onAddLesson={handleAddLesson} // [CTO: Gọi hàm rẽ nhánh]
                  onEditSection={(sec) => setEditingSection(sec)}
                  onEditLesson={(les) => handleEditLesson(les, section.id)} // [CTO: Truyền sectionId lên]
                  onDeleteTrigger={(type, id, title, parentId) => setDeleteConfig({ type, id, name: title, sectionId: parentId })}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* MOUNT TOÀN BỘ MODALS */}
      <CreateSectionModal courseId={courseId} isOpen={isSectionModalOpen} onClose={() => setIsSectionModalOpen(false)} />
      <EditSectionModal courseId={courseId} section={editingSection} onClose={() => setEditingSection(null)} />
      {deleteConfig && <ConfirmDeleteModal courseId={courseId} isOpen={!!deleteConfig} config={deleteConfig} onClose={() => setDeleteConfig(null)} />}
      <AiCourseBuilderModal courseId={courseId} isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />

      {/* Màn hình Lesson Cũ (Static/Video) */}
      <CreateLessonModal courseId={courseId} sectionId={activeSectionIdForLesson || ''} isOpen={!!activeSectionIdForLesson} onClose={() => setActiveSectionIdForLesson(null)} />
      <EditLessonModal courseId={courseId} lessonData={editingLesson} onClose={() => setEditingLesson(null)} />

      {/* Màn hình Lesson Mới (Dynamic Quiz) */}
      <CreateDynamicQuizModal courseId={courseId} sectionId={activeSectionIdForDynamic || ''} isOpen={!!activeSectionIdForDynamic} onClose={() => setActiveSectionIdForDynamic(null)} />
      <EditDynamicQuizModal courseId={courseId} lessonId={editingDynamicLesson?.lessonId || ''} isOpen={!!editingDynamicLesson} onClose={() => setEditingDynamicLesson(null)} />
    </div>
  );
}