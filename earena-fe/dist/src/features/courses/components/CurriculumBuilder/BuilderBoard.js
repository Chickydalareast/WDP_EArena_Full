'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderBoard = BuilderBoard;
const react_1 = require("react");
const core_1 = require("@dnd-kit/core");
const sortable_1 = require("@dnd-kit/sortable");
const useCurriculumBuilder_1 = require("../../hooks/useCurriculumBuilder");
const useCourseSettings_1 = require("../../hooks/useCourseSettings");
const curriculum_utils_1 = require("../../lib/curriculum-utils");
const course_schema_1 = require("../../types/course.schema");
const BuilderSection_1 = require("./BuilderSection");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
const CreateSectionModal_1 = require("./CreateSectionModal");
const CreateLessonModal_1 = require("./CreateLessonModal");
const EditSectionModal_1 = require("./EditSectionModal");
const EditLessonModal_1 = require("./EditLessonModal");
const ConfirmDeleteModal_1 = require("./ConfirmDeleteModal");
const AiCourseBuilderModal_1 = require("./AiCourseBuilderModal");
const CreateDynamicQuizModal_1 = require("./CreateDynamicQuizModal");
const EditDynamicQuizModal_1 = require("./EditDynamicQuizModal");
function BuilderBoard({ courseId }) {
    const { data: treeData, isLoading: isTreeLoading } = (0, useCurriculumBuilder_1.useCurriculumTree)(courseId);
    const { data: course, isLoading: isCourseLoading } = (0, useCourseSettings_1.useCourseSettings)(courseId);
    const { data: stats, isLoading: isStatsLoading } = (0, useCourseSettings_1.useCourseDashboardStats)(courseId);
    const { mutate: reorderCurriculum, isPending: isSaving } = (0, useCurriculumBuilder_1.useReorderCurriculum)(courseId);
    const [localSections, setLocalSections] = (0, react_1.useState)([]);
    const [isDirty, setIsDirty] = (0, react_1.useState)(false);
    const [isSectionModalOpen, setIsSectionModalOpen] = (0, react_1.useState)(false);
    const [isAiModalOpen, setIsAiModalOpen] = (0, react_1.useState)(false);
    const [activeSectionIdForLesson, setActiveSectionIdForLesson] = (0, react_1.useState)(null);
    const [activeSectionIdForDynamic, setActiveSectionIdForDynamic] = (0, react_1.useState)(null);
    const [editingSection, setEditingSection] = (0, react_1.useState)(null);
    const [editingLesson, setEditingLesson] = (0, react_1.useState)(null);
    const [editingDynamicLesson, setEditingDynamicLesson] = (0, react_1.useState)(null);
    const [deleteConfig, setDeleteConfig] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (treeData?.curriculum?.sections && !isDirty) {
            setLocalSections(treeData.curriculum.sections);
        }
    }, [treeData, isDirty]);
    const isStatusLocked = course?.status === course_schema_1.CourseStatus.PENDING_REVIEW;
    const totalStudents = stats?.totalStudents || 0;
    const isStructureLocked = totalStudents > 0;
    const isModeLocked = totalStudents > 0 && course?.progressionMode === 'STRICT_LINEAR';
    const isTotalLocked = isStatusLocked;
    const sensors = (0, core_1.useSensors)((0, core_1.useSensor)(core_1.PointerSensor, { activationConstraint: { distance: 5 } }), (0, core_1.useSensor)(core_1.KeyboardSensor, { coordinateGetter: sortable_1.sortableKeyboardCoordinates }));
    const handleDragEnd = (event) => {
        if (isTotalLocked || isModeLocked)
            return;
        const { active, over } = event;
        if (!over || active.id === over.id)
            return;
        setLocalSections((sections) => {
            const oldIndex = sections.findIndex((s) => s.id === active.id);
            const newIndex = sections.findIndex((s) => s.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                setIsDirty(true);
                return (0, sortable_1.arrayMove)(sections, oldIndex, newIndex);
            }
            return sections;
        });
    };
    const handleSaveStructure = () => {
        const payload = (0, curriculum_utils_1.buildReorderPayload)(localSections);
        reorderCurriculum(payload, { onSuccess: () => setIsDirty(false) });
    };
    const handleAddLesson = (sectionId, type) => {
        if (type === 'DYNAMIC')
            setActiveSectionIdForDynamic(sectionId);
        else
            setActiveSectionIdForLesson(sectionId);
    };
    const handleEditLesson = (lesson, sectionId) => {
        if (lesson.examMode === 'DYNAMIC') {
            setEditingDynamicLesson({ lessonId: lesson.id });
        }
        else {
            setEditingLesson({ lesson, sectionId });
        }
    };
    const isPageLoading = isTreeLoading || isCourseLoading || isStatsLoading;
    if (isPageLoading)
        return <skeleton_1.Skeleton className="w-full h-[500px] rounded-xl"/>;
    return (<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">

      
      {isStatusLocked && (<div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-800">
          <lucide_react_1.AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600"/>
          <div>
            <h4 className="font-bold text-sm">Khóa học đang được kiểm duyệt</h4>
            <p className="text-xs mt-1 font-medium">Hệ thống đã khóa tính năng sửa đổi giáo án để đảm bảo tính toàn vẹn dữ liệu.</p>
          </div>
        </div>)}

      {!isStatusLocked && totalStudents > 0 && (<div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3 text-slate-800">
          <lucide_react_1.Lock className="w-5 h-5 shrink-0 mt-0.5 text-blue-600"/>
          <div>
            <h4 className="font-bold text-sm text-blue-800">Đã kích hoạt Chế độ Bảo vệ Tiến độ</h4>
            <p className="text-xs mt-1 font-medium text-slate-600">
              Khóa học đã có <strong className="text-blue-600">{totalStudents}</strong> học sinh. Tính năng Xóa phân mảnh bị khóa.
              {isModeLocked && " Chức năng kéo thả bị khóa do đang bật chế độ học Tuần tự."}
            </p>
          </div>
        </div>)}

      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Cấu trúc khóa học</h2>
          <span className="text-sm font-medium text-slate-500">Xây dựng lộ trình học tập cho học viên.</span>
        </div>

        <div className="flex items-center gap-3">
          {isDirty && !isTotalLocked && !isModeLocked && (<button_1.Button onClick={handleSaveStructure} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm">
              {isSaving ? <lucide_react_1.Loader2 className="mr-2 w-4 h-4 animate-spin"/> : <lucide_react_1.Save className="mr-2 w-4 h-4"/>}
              {isSaving ? 'Đang lưu...' : 'Lưu Thứ Tự'}
            </button_1.Button>)}

          <button_1.Button onClick={() => setIsAiModalOpen(true)} disabled={isTotalLocked} className="rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-bold shadow-sm disabled:opacity-50">
            <lucide_react_1.Sparkles className="mr-2 w-4 h-4"/> AI Builder
          </button_1.Button>

          <button_1.Button onClick={() => setIsSectionModalOpen(true)} disabled={isTotalLocked} className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold shadow-sm disabled:opacity-50">
            <lucide_react_1.PlusCircle className="mr-2 w-4 h-4"/> Thêm Chương
          </button_1.Button>
        </div>
      </div>

      
      <core_1.DndContext sensors={sensors} collisionDetection={core_1.closestCenter} onDragEnd={handleDragEnd}>
        <sortable_1.SortableContext items={localSections.map(s => s.id)} strategy={sortable_1.verticalListSortingStrategy}>
          <div className="space-y-4">
            {localSections.length === 0 ? (<div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <p className="text-slate-500 font-medium">Chưa có chương học nào. Bắt đầu bằng cách tạo chương mới!</p>
              </div>) : (localSections.map((section) => (<BuilderSection_1.BuilderSection key={section.id} section={section} isTotalLocked={isTotalLocked} isStructureLocked={isStructureLocked} isModeLocked={isModeLocked} onAddLesson={handleAddLesson} onEditSection={(sec) => setEditingSection(sec)} onEditLesson={(les) => handleEditLesson(les, section.id)} onDeleteTrigger={(type, id, title, parentId) => setDeleteConfig({ type, id, name: title, sectionId: parentId })}/>)))}
          </div>
        </sortable_1.SortableContext>
      </core_1.DndContext>

      
      <CreateSectionModal_1.CreateSectionModal courseId={courseId} isOpen={isSectionModalOpen} onClose={() => setIsSectionModalOpen(false)}/>
      <EditSectionModal_1.EditSectionModal courseId={courseId} section={editingSection} onClose={() => setEditingSection(null)}/>
      {deleteConfig && <ConfirmDeleteModal_1.ConfirmDeleteModal courseId={courseId} isOpen={!!deleteConfig} config={deleteConfig} onClose={() => setDeleteConfig(null)}/>}
      <AiCourseBuilderModal_1.AiCourseBuilderModal courseId={courseId} isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)}/>

      
      <CreateLessonModal_1.CreateLessonModal courseId={courseId} sectionId={activeSectionIdForLesson || ''} isOpen={!!activeSectionIdForLesson} onClose={() => setActiveSectionIdForLesson(null)}/>
      <EditLessonModal_1.EditLessonModal courseId={courseId} lessonData={editingLesson} onClose={() => setEditingLesson(null)}/>

      
      <CreateDynamicQuizModal_1.CreateDynamicQuizModal courseId={courseId} sectionId={activeSectionIdForDynamic || ''} isOpen={!!activeSectionIdForDynamic} onClose={() => setActiveSectionIdForDynamic(null)}/>
      <EditDynamicQuizModal_1.EditDynamicQuizModal courseId={courseId} lessonId={editingDynamicLesson?.lessonId || ''} isOpen={!!editingDynamicLesson} onClose={() => setEditingDynamicLesson(null)}/>
    </div>);
}
//# sourceMappingURL=BuilderBoard.js.map