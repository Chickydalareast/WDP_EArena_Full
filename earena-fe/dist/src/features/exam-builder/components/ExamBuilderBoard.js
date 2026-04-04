'use client';
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamBuilderBoard = ExamBuilderBoard;
const react_1 = __importStar(require("react"));
const navigation_1 = require("next/navigation");
const core_1 = require("@dnd-kit/core");
const sortable_1 = require("@dnd-kit/sortable");
const usePaperDetail_1 = require("../hooks/usePaperDetail");
const useQuestionMutations_1 = require("../hooks/useQuestionMutations");
const useUpdatePaper_1 = require("../hooks/useUpdatePaper");
const usePublishExam_1 = require("../hooks/usePublishExam");
const useUpdatePoints_1 = require("../hooks/useUpdatePoints");
const useSession_1 = require("@/features/auth/hooks/useSession");
const BulkManualQuestionForm_1 = require("./BulkManualQuestionForm");
const EditQuestionSheet_1 = require("./EditQuestionSheet");
const SortableQuestionCard_1 = require("./SortableQuestionCard");
const MiniBankSidebar_1 = require("./MiniBankSidebar");
const MiniQuestionCard_1 = require("./MiniQuestionCard");
const MatrixBuilderDrawer_1 = require("./MatrixBuilderDrawer");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
const utils_1 = require("@/shared/lib/utils");
const DroppableBoardArea = react_1.default.forwardRef(({ id, children, className }, forwardedRef) => {
    const { setNodeRef } = (0, core_1.useDroppable)({ id });
    const setRefs = (0, react_1.useCallback)((node) => {
        setNodeRef(node);
        if (typeof forwardedRef === 'function')
            forwardedRef(node);
        else if (forwardedRef)
            forwardedRef.current = node;
    }, [setNodeRef, forwardedRef]);
    return <div ref={setRefs} className={className}>{children}</div>;
});
DroppableBoardArea.displayName = 'DroppableBoardArea';
function ExamBuilderBoard() {
    const router = (0, navigation_1.useRouter)();
    const params = (0, navigation_1.useParams)();
    const searchParams = (0, navigation_1.useSearchParams)();
    const urlExamId = params.examId;
    const paperId = searchParams.get('paperId');
    const { user } = (0, useSession_1.useSession)();
    const { data: paperResponse, isLoading } = (0, usePaperDetail_1.usePaperDetail)(paperId || '');
    const paper = paperResponse?.data || paperResponse;
    const isPublished = paper?.examId?.isPublished ?? (searchParams.get('isPublished') === 'true');
    const subjectId = paper?.examId?.subjectId || user?.subjects?.[0]?.id;
    const { mutate: addBulkManual, isPending: isAddingBulk } = (0, useQuestionMutations_1.useAddBulkManual)(paperId || '');
    const { mutate: updatePaper, isPending: isUpdatingPaper } = (0, useUpdatePaper_1.useUpdatePaper)(paperId || '');
    const { mutate: publishExam, isPending: isPublishing } = (0, usePublishExam_1.usePublishExam)(paperId || '');
    const { mutate: updatePoints, isPending: isUpdatingPoints } = (0, useUpdatePoints_1.useUpdatePoints)(paperId || '');
    const [activeMode, setActiveMode] = (0, react_1.useState)('NONE');
    const [isMatrixDrawerOpen, setIsMatrixDrawerOpen] = (0, react_1.useState)(false);
    const [selectedEditQuestion, setSelectedEditQuestion] = (0, react_1.useState)(null);
    const [draftPoints, setDraftPoints] = (0, react_1.useState)({});
    const isDirty = Object.keys(draftPoints).length > 0;
    const [localQuestions, setLocalQuestions] = (0, react_1.useState)([]);
    const [activeDragItem, setActiveDragItem] = (0, react_1.useState)(null);
    const scrollRef = (0, react_1.useRef)(null);
    const previousQuestionsCount = (0, react_1.useRef)(0);
    const isInitialRender = (0, react_1.useRef)(true);
    (0, react_1.useEffect)(() => {
        if (paper?.questions && !activeDragItem && !isUpdatingPaper) {
            setLocalQuestions(paper.questions);
        }
    }, [paper?.questions, activeDragItem, isUpdatingPaper]);
    (0, react_1.useEffect)(() => {
        if (isInitialRender.current) {
            if (localQuestions.length > 0) {
                previousQuestionsCount.current = localQuestions.length;
                isInitialRender.current = false;
            }
            return;
        }
        if (localQuestions.length > previousQuestionsCount.current) {
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTo({
                        top: scrollRef.current.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            }, 300);
        }
        previousQuestionsCount.current = localQuestions.length;
    }, [localQuestions.length]);
    const displayQuestions = (0, react_1.useMemo)(() => {
        let globalCounter = 1;
        return localQuestions.map(q => {
            if (q.type === 'PASSAGE') {
                const processedSubs = (q.subQuestions || []).map(sub => ({ ...sub, displayNumber: globalCounter++ }));
                return { ...q, processedSubQuestions: processedSubs };
            }
            return { ...q, displayNumber: globalCounter++ };
        });
    }, [localQuestions]);
    const existingQuestionIds = (0, react_1.useMemo)(() => localQuestions.map(q => q.originalQuestionId), [localQuestions]);
    const sensors = (0, core_1.useSensors)((0, core_1.useSensor)(core_1.PointerSensor, { activationConstraint: { distance: 5 } }));
    const handlePointChange = (0, react_1.useCallback)((id, value, originalPoints) => {
        setDraftPoints(prev => {
            const newDraft = { ...prev };
            if (Number.isNaN(value) || value < 0 || value === originalPoints) {
                delete newDraft[id];
            }
            else {
                newDraft[id] = value;
            }
            return newDraft;
        });
    }, []);
    const handleSavePoints = () => {
        const pointsData = Object.entries(draftPoints).map(([id, p]) => ({ questionId: id, points: p }));
        updatePoints({ pointsData }, { onSuccess: () => setDraftPoints({}) });
    };
    const handleAutoDividePoints = () => {
        if (confirm('Hệ thống sẽ tự động tính toán và phân bổ điểm đều cho tất cả câu hỏi. Bạn có chắc chắn?')) {
            updatePoints({ divideEqually: true }, { onSuccess: () => setDraftPoints({}) });
        }
    };
    const handleOpenMatrix = () => {
        if (isDirty)
            return sonner_1.toast.warning('Cảnh báo: Dữ liệu chưa lưu', { description: 'Vui lòng Cập Nhật Điểm trước khi tạo từ Ma trận.' });
        if (!subjectId)
            return sonner_1.toast.error('Lỗi dữ liệu', { description: 'Đề thi thiếu dữ liệu Môn học. Không thể gọi Ma trận.' });
        setIsMatrixDrawerOpen(true);
    };
    const handleDragStart = (event) => { if (!isPublished)
        setActiveDragItem(event.active); };
    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveDragItem(null);
        if (!over || isPublished)
            return;
        const activeId = String(active.id);
        const overId = String(over.id);
        if (activeId.startsWith('bank-')) {
            const bankQuestion = active.data.current?.questionData;
            if (!bankQuestion)
                return;
            const qId = bankQuestion._id || bankQuestion.id;
            if (existingQuestionIds.includes(qId))
                return sonner_1.toast.error('Câu hỏi này đã tồn tại trong đề thi.');
            setLocalQuestions(prev => [...prev, bankQuestion]);
            updatePaper({ action: 'ADD', questionId: qId, questionData: { ...bankQuestion, originalQuestionId: qId } });
            return;
        }
        if (activeId !== overId && overId !== 'exam-board-droppable-area') {
            const oldIndex = localQuestions.findIndex(q => q.originalQuestionId === activeId);
            const newIndex = localQuestions.findIndex(q => q.originalQuestionId === overId);
            if (oldIndex === -1 || newIndex === -1)
                return;
            const newQuestionsArray = (0, sortable_1.arrayMove)(localQuestions, oldIndex, newIndex);
            setLocalQuestions(newQuestionsArray);
            updatePaper({ action: 'REORDER', questionIds: newQuestionsArray.map(q => q.originalQuestionId) });
        }
    };
    const handleRemove = (0, react_1.useCallback)((questionId) => {
        if (!questionId)
            return;
        setLocalQuestions(prev => prev.filter(q => q.originalQuestionId !== questionId));
        updatePaper({ action: 'REMOVE', questionId: questionId });
    }, [updatePaper]);
    if (!paperId || paperId === 'undefined')
        return <div className="p-12 text-center text-destructive font-medium">Đường dẫn không hợp lệ!</div>;
    if (isLoading)
        return <div className="flex flex-col items-center justify-center p-20 min-h-[50vh]"><lucide_react_1.Loader2 className="animate-spin w-10 h-10 text-primary"/></div>;
    return (<core_1.DndContext sensors={sensors} collisionDetection={core_1.closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>

      
      <div className={`flex flex-col h-[calc(100vh-4rem)] ${activeMode === 'BANK' ? 'overflow-hidden' : 'overflow-y-auto pb-32 max-w-[1400px] w-full mx-auto'}`}>

        
        <header className="shrink-0 z-20 bg-background/80 backdrop-blur-md border border-border shadow-sm p-4 m-4 rounded-2xl flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
          <div className="flex items-center gap-4">
            <button_1.Button variant="ghost" size="icon" onClick={() => router.push('/teacher/exams')} className="text-muted-foreground hover:text-foreground">
              <lucide_react_1.ArrowLeft className="w-5 h-5"/>
            </button_1.Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-foreground tracking-tight">Không Gian Soạn Đề</h1>
                {isPublished && (<span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                    <lucide_react_1.Lock className="w-3 h-3 mr-1"/> ĐÃ XUẤT BẢN
                  </span>)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
            
            
            {!isPublished && (<div className="flex flex-wrap items-center gap-1 bg-secondary/40 p-1.5 rounded-xl border border-border">
                <button_1.Button variant="ghost" size="sm" onClick={handleAutoDividePoints} disabled={isUpdatingPoints} className="font-medium text-muted-foreground hover:text-foreground">
                  <lucide_react_1.Calculator className="w-4 h-4 mr-2"/> Phân Bổ Điểm
                </button_1.Button>
                <div className="w-px h-5 bg-border mx-1 hidden sm:block"></div>
                
                <button_1.Button variant={activeMode === 'MANUAL' ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveMode(activeMode === 'MANUAL' ? 'NONE' : 'MANUAL')} className="font-medium">
                  <lucide_react_1.PlusCircle className="w-4 h-4 mr-2"/> Thêm Thủ Công
                </button_1.Button>
                
                <button_1.Button variant={activeMode === 'BANK' ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveMode(activeMode === 'BANK' ? 'NONE' : 'BANK')} className="font-medium">
                  <lucide_react_1.Database className="w-4 h-4 mr-2"/> Từ Ngân Hàng
                </button_1.Button>
                
                <button_1.Button variant="ghost" size="sm" onClick={handleOpenMatrix} className="font-medium">
                  <lucide_react_1.Settings2 className="w-4 h-4 mr-2"/> Tạo Từ Ma Trận
                </button_1.Button>
              </div>)}

            
            <div className="flex items-center gap-2 ml-auto xl:ml-2">
              {isDirty && !isPublished && (<button_1.Button variant="default" onClick={handleSavePoints} disabled={isUpdatingPoints} className="animate-in fade-in zoom-in font-semibold shadow-sm">
                  {isUpdatingPoints ? <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <lucide_react_1.Save className="w-4 h-4 mr-2"/>} Cập Nhật Điểm ({Object.keys(draftPoints).length})
                </button_1.Button>)}

              {!isPublished && (<button_1.Button variant="default" onClick={() => publishExam(paper?.examId?._id || urlExamId)} disabled={isPublishing || localQuestions.length === 0} className="font-semibold shadow-sm">
                  {isPublishing ? <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <lucide_react_1.Zap className="w-4 h-4 mr-2"/>} Phát Hành Đề Thi
                </button_1.Button>)}
            </div>
          </div>
        </header>

        
        {!isPublished && activeMode === 'MANUAL' && (<div className="px-4 mb-4 animate-in slide-in-from-top-4 fade-in">
            <BulkManualQuestionForm_1.BulkManualQuestionForm mode="QUICK_EXAM" isPending={isAddingBulk} onSave={(newQs) => { addBulkManual({ questionsData: newQs, folderId: paper?.folderId || '' }, { onSuccess: () => setActiveMode('NONE') }); }} onCancel={() => setActiveMode('NONE')}/>
          </div>)}

        <div className={`flex flex-1 overflow-hidden transition-all duration-300 ${activeMode === 'BANK' ? 'px-0' : 'px-4'}`}>

          
          <div className={(0, utils_1.cn)("h-full overflow-y-auto scrollbar-thin scrollbar-thumb-border transition-all duration-300", activeMode === 'BANK' ? "w-[70%] px-6 pb-20 border-r border-border bg-slate-50/30" : "w-full")}>
            <div className="flex items-center gap-2 text-muted-foreground mb-4 ml-2 mt-2">
              <lucide_react_1.FileText className="w-5 h-5"/>
              <h2 className="font-bold uppercase tracking-widest text-sm">Cấu Trúc Đề Thi ({localQuestions.length} câu)</h2>
            </div>

            <sortable_1.SortableContext items={displayQuestions.map((q, i) => String(q.originalQuestionId || q._id || `fallback-${i}`))} strategy={sortable_1.verticalListSortingStrategy}>
              <DroppableBoardArea id="exam-board-droppable-area" ref={scrollRef} className="flex-1 overflow-y-auto p-2 pb-12 space-y-4 min-h-[500px]">
                {displayQuestions.length === 0 ? (<div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60">
                    <lucide_react_1.FileText className="w-16 h-16 mb-4 opacity-50"/>
                    <p className="font-medium">Chưa có câu hỏi nào trong đề thi.</p>
                  </div>) : (displayQuestions.map((q, index) => (<SortableQuestionCard_1.SortableQuestionCard key={String(q.originalQuestionId || q._id || `fallback-${index}`)} question={q} answerKeys={paper?.answerKeys || []} isPublished={isPublished} draftPoints={draftPoints} onPointChange={handlePointChange} onEdit={() => setSelectedEditQuestion(q)} onRemove={handleRemove}/>)))}
              </DroppableBoardArea>
            </sortable_1.SortableContext>
          </div>

          {activeMode === 'BANK' && (<div className="w-[30%] h-full shrink-0 bg-background animate-in slide-in-from-right-10 duration-300 border-l border-border shadow-[-10px_0_20px_rgba(0,0,0,0.02)]">
              <MiniBankSidebar_1.MiniBankSidebar existingQuestionIds={existingQuestionIds}/>
            </div>)}
        </div>
      </div>

      <core_1.DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeDragItem ? (activeDragItem.id.toString().startsWith('bank-') ? (<div className="opacity-95 scale-105 rotate-2 pointer-events-none w-80 shadow-2xl rounded-xl overflow-hidden border border-primary/20">
              <MiniQuestionCard_1.MiniQuestionCardUI question={activeDragItem.data.current?.questionData}/>
            </div>) : (<div className="opacity-90 scale-105 pointer-events-none bg-background border-2 border-primary/50 p-6 rounded-2xl shadow-2xl flex items-center gap-3 text-primary font-bold">
              <lucide_react_1.GripVertical className="w-5 h-5"/> Đang di chuyển...
            </div>)) : null}
      </core_1.DragOverlay>

      <EditQuestionSheet_1.EditQuestionSheet question={selectedEditQuestion} answerKeys={paper?.answerKeys || []} paperId={paperId || ''} onClose={() => setSelectedEditQuestion(null)}/>

      {subjectId && (<MatrixBuilderDrawer_1.MatrixBuilderDrawer isOpen={isMatrixDrawerOpen} onClose={() => setIsMatrixDrawerOpen(false)} paperId={paperId || ''} subjectId={subjectId}/>)}

    </core_1.DndContext>);
}
//# sourceMappingURL=ExamBuilderBoard.js.map