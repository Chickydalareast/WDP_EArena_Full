'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

// --- DND KIT IMPORTS ---
import {
  DndContext, DragEndEvent, DragOverlay, PointerSensor,
  useSensor, useSensors, closestCenter, useDroppable
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';

import { usePaperDetail } from '../hooks/usePaperDetail';
import { useAddBulkManual } from '../hooks/useQuestionMutations';
import { useUpdatePaper } from '../hooks/useUpdatePaper';
import { usePublishExam } from '../hooks/usePublishExam';
import { useUpdatePoints } from '../hooks/useUpdatePoints';
import { useSession } from '@/features/auth/hooks/useSession';

import { BulkManualQuestionForm } from './BulkManualQuestionForm';
import { EditQuestionSheet } from './EditQuestionSheet';
import { SortableQuestionCard } from './SortableQuestionCard';
import { MiniBankSidebar } from './MiniBankSidebar';
import { MiniQuestionCardUI } from './MiniQuestionCard';
import { MatrixBuilderDrawer } from './MatrixBuilderDrawer';

import { PopulatedQuestion } from '../lib/hydration-utils';
import { Button } from '@/shared/components/ui/button';
import { PlusCircle, ArrowLeft, Loader2, FileText, Lock, Zap, Database, GripVertical, Settings2, Calculator, Save } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';

// Merge Refs Component
const DroppableBoardArea = React.forwardRef<HTMLDivElement, { id: string, children: React.ReactNode, className?: string }>(({ id, children, className }, forwardedRef) => {
  const { setNodeRef } = useDroppable({ id });
  const setRefs = useCallback((node: HTMLDivElement | null) => {
    setNodeRef(node);
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [setNodeRef, forwardedRef]);
  return <div ref={setRefs} className={className}>{children}</div>;
});
DroppableBoardArea.displayName = 'DroppableBoardArea';

export function ExamBuilderBoard() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const urlExamId = params.examId as string;
  const paperId = searchParams.get('paperId');

  const { user } = useSession();

  const { data: paperResponse, isLoading } = usePaperDetail(paperId || '');
  // @ts-ignore
  const paper = paperResponse?.data || paperResponse;

  const isPublished = paper?.examId?.isPublished ?? (searchParams.get('isPublished') === 'true');
  const subjectId = paper?.examId?.subjectId || user?.subjects?.[0]?.id;

  const { mutate: addBulkManual, isPending: isAddingBulk } = useAddBulkManual(paperId || '');
  const { mutate: updatePaper, isPending: isUpdatingPaper } = useUpdatePaper(paperId || '');
  const { mutate: publishExam, isPending: isPublishing } = usePublishExam(paperId || '');
  const { mutate: updatePoints, isPending: isUpdatingPoints } = useUpdatePoints(paperId || '');

  // Cập nhật State: Xóa bỏ IMPORT
  const [activeMode, setActiveMode] = useState<'NONE' | 'MANUAL' | 'BANK'>('NONE');
  const [isMatrixDrawerOpen, setIsMatrixDrawerOpen] = useState(false);
  const [selectedEditQuestion, setSelectedEditQuestion] = useState<PopulatedQuestion | null>(null);

  const [draftPoints, setDraftPoints] = useState<Record<string, number>>({});
  const isDirty = Object.keys(draftPoints).length > 0;

  const [localQuestions, setLocalQuestions] = useState<PopulatedQuestion[]>([]);
  const [activeDragItem, setActiveDragItem] = useState<any | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const previousQuestionsCount = useRef(0);
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (paper?.questions && !activeDragItem && !isUpdatingPaper) {
      setLocalQuestions(paper.questions);
    }
  }, [paper?.questions, activeDragItem, isUpdatingPaper]);

  useEffect(() => {
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

  const displayQuestions = useMemo(() => {
    let globalCounter = 1;
    return localQuestions.map(q => {
      if (q.type === 'PASSAGE') {
        const processedSubs = (q.subQuestions || []).map(sub => ({ ...sub, displayNumber: globalCounter++ }));
        return { ...q, processedSubQuestions: processedSubs };
      }
      return { ...q, displayNumber: globalCounter++ };
    });
  }, [localQuestions]);

  const existingQuestionIds = useMemo(() => localQuestions.map(q => q.originalQuestionId), [localQuestions]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handlePointChange = useCallback((id: string, value: number, originalPoints?: number) => {
    setDraftPoints(prev => {
      const newDraft = { ...prev };
      if (Number.isNaN(value) || value < 0 || value === originalPoints) {
        delete newDraft[id];
      } else {
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
    if (isDirty) return toast.warning('Cảnh báo: Dữ liệu chưa lưu', { description: 'Vui lòng Cập Nhật Điểm trước khi tạo từ Ma trận.' });
    if (!subjectId) return toast.error('Lỗi dữ liệu', { description: 'Đề thi thiếu dữ liệu Môn học. Không thể gọi Ma trận.' });
    setIsMatrixDrawerOpen(true);
  };

  const handleDragStart = (event: any) => { if (!isPublished) setActiveDragItem(event.active); };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);
    if (!over || isPublished) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith('bank-')) {
      const bankQuestion = active.data.current?.questionData;
      if (!bankQuestion) return;
      const qId = bankQuestion._id || bankQuestion.id;
      if (existingQuestionIds.includes(qId)) return toast.error('Câu hỏi này đã tồn tại trong đề thi.');

      setLocalQuestions(prev => [...prev, bankQuestion]);
      updatePaper({ action: 'ADD', questionId: qId, questionData: { ...bankQuestion, originalQuestionId: qId } });
      return;
    }

    if (activeId !== overId && overId !== 'exam-board-droppable-area') {
      const oldIndex = localQuestions.findIndex(q => q.originalQuestionId === activeId);
      const newIndex = localQuestions.findIndex(q => q.originalQuestionId === overId);
      if (oldIndex === -1 || newIndex === -1) return;

      const newQuestionsArray = arrayMove(localQuestions, oldIndex, newIndex);
      setLocalQuestions(newQuestionsArray);
      updatePaper({ action: 'REORDER', questionIds: newQuestionsArray.map(q => q.originalQuestionId) });
    }
  };

  const handleRemove = useCallback((questionId?: string) => {
    if (!questionId) return;
    setLocalQuestions(prev => prev.filter(q => q.originalQuestionId !== questionId));
    updatePaper({ action: 'REMOVE', questionId: questionId });
  }, [updatePaper]);

  if (!paperId || paperId === 'undefined') return <div className="p-12 text-center text-destructive font-medium">Đường dẫn không hợp lệ!</div>;
  if (isLoading) return <div className="flex flex-col items-center justify-center p-20 min-h-[50vh]"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>

      {/* TĂNG CHIỀU RỘNG LÊN MAX-W-1400PX */}
      <div className={`flex flex-col h-[calc(100vh-4rem)] ${activeMode === 'BANK' ? 'overflow-hidden' : 'overflow-y-auto pb-32 max-w-[1400px] w-full mx-auto'}`}>

        {/* HEADER TOOLBAR ĐÃ ĐƯỢC LÀM SẠCH */}
        <header className="shrink-0 z-20 bg-background/80 backdrop-blur-md border border-border shadow-sm p-4 m-4 rounded-2xl flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/teacher/exams')} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-foreground tracking-tight">Không Gian Soạn Đề</h1>
                {isPublished && (
                  <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                    <Lock className="w-3 h-3 mr-1" /> ĐÃ XUẤT BẢN
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
            
            {/* NHÓM CÔNG CỤ SOẠN THẢO (THIẾT KẾ DẠNG TOOLBAR SEGMENTED) */}
            {!isPublished && (
              <div className="flex flex-wrap items-center gap-1 bg-secondary/40 p-1.5 rounded-xl border border-border">
                <Button variant="ghost" size="sm" onClick={handleAutoDividePoints} disabled={isUpdatingPoints} className="font-medium text-muted-foreground hover:text-foreground">
                  <Calculator className="w-4 h-4 mr-2" /> Phân Bổ Điểm
                </Button>
                <div className="w-px h-5 bg-border mx-1 hidden sm:block"></div>
                
                <Button variant={activeMode === 'MANUAL' ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveMode(activeMode === 'MANUAL' ? 'NONE' : 'MANUAL')} className="font-medium">
                  <PlusCircle className="w-4 h-4 mr-2" /> Thêm Thủ Công
                </Button>
                
                <Button variant={activeMode === 'BANK' ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveMode(activeMode === 'BANK' ? 'NONE' : 'BANK')} className="font-medium">
                  <Database className="w-4 h-4 mr-2" /> Từ Ngân Hàng
                </Button>
                
                <Button variant="ghost" size="sm" onClick={handleOpenMatrix} className="font-medium">
                  <Settings2 className="w-4 h-4 mr-2" /> Tạo Từ Ma Trận
                </Button>
              </div>
            )}

            {/* NHÓM HÀNH ĐỘNG CHÍNH */}
            <div className="flex items-center gap-2 ml-auto xl:ml-2">
              {isDirty && !isPublished && (
                <Button variant="default" onClick={handleSavePoints} disabled={isUpdatingPoints} className="animate-in fade-in zoom-in font-semibold shadow-sm">
                  {isUpdatingPoints ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Cập Nhật Điểm ({Object.keys(draftPoints).length})
                </Button>
              )}

              {!isPublished && (
                <Button variant="default" onClick={() => publishExam(paper?.examId?._id || urlExamId)} disabled={isPublishing || localQuestions.length === 0} className="font-semibold shadow-sm">
                  {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />} Phát Hành Đề Thi
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* VÙNG INSERT MANUALLY */}
        {!isPublished && activeMode === 'MANUAL' && (
          <div className="px-4 mb-4 animate-in slide-in-from-top-4 fade-in">
            <BulkManualQuestionForm mode="QUICK_EXAM" isPending={isAddingBulk} onSave={(newQs) => { addBulkManual({ questionsData: newQs, folderId: paper?.folderId || '' }, { onSuccess: () => setActiveMode('NONE') }); }} onCancel={() => setActiveMode('NONE')} />
          </div>
        )}

        <div className={`flex flex-1 overflow-hidden transition-all duration-300 ${activeMode === 'BANK' ? 'px-0' : 'px-4'}`}>

          {/* VÙNG CHỨA CÂU HỎI */}
          <div className={cn(
            "h-full overflow-y-auto scrollbar-thin scrollbar-thumb-border transition-all duration-300",
            activeMode === 'BANK' ? "w-[70%] px-6 pb-20 border-r border-border bg-slate-50/30" : "w-full"
          )}>
            <div className="flex items-center gap-2 text-muted-foreground mb-4 ml-2 mt-2">
              <FileText className="w-5 h-5" />
              <h2 className="font-bold uppercase tracking-widest text-sm">Cấu Trúc Đề Thi ({localQuestions.length} câu)</h2>
            </div>

            <SortableContext items={displayQuestions.map((q, i) => String(q.originalQuestionId || q._id || `fallback-${i}`))} strategy={verticalListSortingStrategy}>
              <DroppableBoardArea id="exam-board-droppable-area" ref={scrollRef} className="flex-1 overflow-y-auto p-2 pb-12 space-y-4 min-h-[500px]">
                {displayQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60">
                    <FileText className="w-16 h-16 mb-4 opacity-50" />
                    <p className="font-medium">Chưa có câu hỏi nào trong đề thi.</p>
                  </div>
                ) : (
                  displayQuestions.map((q, index) => (
                    <SortableQuestionCard
                      key={String(q.originalQuestionId || q._id || `fallback-${index}`)}
                      question={q}
                      answerKeys={paper?.answerKeys || []}
                      isPublished={isPublished}
                      draftPoints={draftPoints}
                      onPointChange={handlePointChange}
                      onEdit={() => setSelectedEditQuestion(q)}
                      onRemove={handleRemove}
                    />
                  ))
                )}
              </DroppableBoardArea>
            </SortableContext>
          </div>

          {activeMode === 'BANK' && (
            <div className="w-[30%] h-full shrink-0 bg-background animate-in slide-in-from-right-10 duration-300 border-l border-border shadow-[-10px_0_20px_rgba(0,0,0,0.02)]">
              <MiniBankSidebar existingQuestionIds={existingQuestionIds} />
            </div>
          )}
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeDragItem ? (
          activeDragItem.id.toString().startsWith('bank-') ? (
            <div className="opacity-95 scale-105 rotate-2 pointer-events-none w-80 shadow-2xl rounded-xl overflow-hidden border border-primary/20">
              <MiniQuestionCardUI question={activeDragItem.data.current?.questionData} />
            </div>
          ) : (
            <div className="opacity-90 scale-105 pointer-events-none bg-background border-2 border-primary/50 p-6 rounded-2xl shadow-2xl flex items-center gap-3 text-primary font-bold">
              <GripVertical className="w-5 h-5" /> Đang di chuyển...
            </div>
          )
        ) : null}
      </DragOverlay>

      <EditQuestionSheet question={selectedEditQuestion} answerKeys={paper?.answerKeys || []} paperId={paperId || ''} onClose={() => setSelectedEditQuestion(null)} />

      {subjectId && (
        <MatrixBuilderDrawer
          isOpen={isMatrixDrawerOpen}
          onClose={() => setIsMatrixDrawerOpen(false)}
          paperId={paperId || ''}
          subjectId={subjectId}
        />
      )}

    </DndContext>
  );
}