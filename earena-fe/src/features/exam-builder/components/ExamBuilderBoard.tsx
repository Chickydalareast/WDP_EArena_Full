'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

// --- DND KIT IMPORTS ---
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable // 1. THÊM IMPORT useDroppable
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';

import { usePaperDetail } from '../hooks/usePaperDetail';
import { useAddBulkManual } from '../hooks/useQuestionMutations';
import { useUpdatePaper } from '../hooks/useUpdatePaper';
import { usePublishExam } from '../hooks/usePublishExam';

import { BulkManualQuestionForm } from './BulkManualQuestionForm';
import { ImportDocxModal } from './ImportDocxModal';
import { EditQuestionSheet } from './EditQuestionSheet';
import { SortableQuestionCard } from './SortableQuestionCard';
import { MiniBankSidebar } from './MiniBankSidebar';
import { MiniQuestionCard, MiniQuestionCardUI } from './MiniQuestionCard'; // 2. IMPORT THÊM MiniQuestionCardUI DÙNG CHO OVERLAY

import { PopulatedQuestion, AnswerKey } from '../lib/hydration-utils';
import { Button } from '@/shared/components/ui/button';
import { PlusCircle, FileUp, ArrowLeft, Loader2, AlertCircle, FileText, Lock, Zap, Database, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

// 3. TẠO COMPONENT BỌC DROPPABLE ĐỂ TRÁNH LỖI REACT CONTEXT 
// (Vì useDroppable phải được gọi bên trong <DndContext>)
function DroppableBoardArea({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  );
}

export function ExamBuilderBoard() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const urlExamId = params.examId as string;
  const paperId = searchParams.get('paperId');
  const isPublished = searchParams.get('isPublished') === 'true';

  const [activeMode, setActiveMode] = useState<'NONE' | 'MANUAL' | 'IMPORT' | 'BANK'>('NONE');
  const [selectedEditQuestion, setSelectedEditQuestion] = useState<PopulatedQuestion | null>(null);

  const { data: paper, isLoading } = usePaperDetail(paperId || '');
  
  const { mutate: addBulkManual, isPending: isAddingBulk } = useAddBulkManual(paperId || '');
  const { mutate: updatePaper } = useUpdatePaper(paperId || '');
  const { mutate: publishExam, isPending: isPublishing } = usePublishExam(paperId || '');

  // --- LOCAL STATE CHO OPTIMISTIC DND REORDER ---
  const [localQuestions, setLocalQuestions] = useState<PopulatedQuestion[]>([]);
  const [activeDragItem, setActiveDragItem] = useState<any | null>(null);

  useEffect(() => {
    if (paper?.questions) {
      setLocalQuestions(paper.questions);
    }
  }, [paper?.questions]);

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, 
      },
    })
  );

  const handleDragStart = (event: any) => {
    if (isPublished) return;
    setActiveDragItem(event.active);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // KÉO TỪ NGÂN HÀNG VÀO TỜ ĐỀ
    if (activeId.startsWith('bank-')) {
      const bankQuestion = active.data.current?.questionData;
      if (!bankQuestion) return;

      const qId = bankQuestion._id || bankQuestion.id;
      if (existingQuestionIds.includes(qId)) return toast.error('Câu hỏi này đã có trong đề');

      setLocalQuestions(prev => [...prev, bankQuestion]);

      updatePaper({
        action: 'ADD',
        questionId: qId,
        questionData: { ...bankQuestion, originalQuestionId: qId }
      });
      return;
    }

    // SẮP XẾP LẠI TRONG TỜ ĐỀ (Bỏ qua nếu thả vào vùng trống ngoài các thẻ câu hỏi)
    if (activeId !== overId && overId !== 'exam-board-droppable-area') {
      const oldIndex = localQuestions.findIndex(q => q.originalQuestionId === activeId);
      const newIndex = localQuestions.findIndex(q => q.originalQuestionId === overId);

      if (oldIndex === -1 || newIndex === -1) return;

      const newQuestionsArray = arrayMove(localQuestions, oldIndex, newIndex);
      setLocalQuestions(newQuestionsArray);

      const rootIds = newQuestionsArray.map(q => q.originalQuestionId);
      updatePaper({ action: 'REORDER', questionIds: rootIds });
    }
  };

  const handleRemove = (questionId?: string) => {
    if (!questionId) {
      toast.error('Lỗi dữ liệu', { description: 'Không tìm thấy ID câu hỏi để xóa.' });
      return;
    }

    setLocalQuestions((prev) => prev.filter((q) => q.originalQuestionId !== questionId));

    updatePaper({
      action: 'REMOVE',
      questionId: questionId,
    });
  };

  if (!paperId || paperId === 'undefined') return <div className="p-12 text-center text-red-500">Đường dẫn không hợp lệ!</div>;
  if (isLoading) return <div className="flex flex-col items-center p-20"><Loader2 className="animate-spin w-10 h-10 text-blue-500" /></div>;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>

      <div className={`flex flex-col h-[calc(100vh-4rem)] ${activeMode === 'BANK' ? 'overflow-hidden' : 'overflow-y-auto pb-32 max-w-5xl mx-auto'}`}>

        <header className="shrink-0 z-20 bg-white/80 backdrop-blur-md border shadow-sm p-4 m-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/teacher/exams')}><ArrowLeft className="w-5 h-5" /></Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-slate-800">Không gian Soạn Đề</h1>
                {isPublished && <span className="bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold"><Lock className="w-3 h-3 inline mr-1" /> ĐÃ CHỐT</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isPublished && (
              <>
                <Button variant={activeMode === 'BANK' ? 'default' : 'outline'} onClick={() => setActiveMode(activeMode === 'BANK' ? 'NONE' : 'BANK')} className={activeMode === 'BANK' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50'}>
                  <Database className="w-4 h-4 mr-2" /> {activeMode === 'BANK' ? 'Đóng Ngân hàng' : 'Mở Ngân hàng'}
                </Button>

                <Button variant={activeMode === 'MANUAL' ? 'secondary' : 'outline'} onClick={() => setActiveMode(activeMode === 'MANUAL' ? 'NONE' : 'MANUAL')} className="font-bold border-blue-200 text-blue-600"><PlusCircle className="w-4 h-4 mr-2" /> Thêm tay</Button>
                <Button variant={activeMode === 'IMPORT' ? 'secondary' : 'outline'} onClick={() => setActiveMode(activeMode === 'IMPORT' ? 'NONE' : 'IMPORT')} className="font-bold border-purple-200 text-purple-600"><FileUp className="w-4 h-4 mr-2" /> Import Word</Button>

                <Button onClick={() => publishExam(paper?.examId?._id || urlExamId)} disabled={isPublishing || localQuestions.length === 0} className="font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg">
                  {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />} Chốt Đề
                </Button>
              </>
            )}
          </div>
        </header>

        {/* BLOCK RENDER FORM */}
        {!isPublished && activeMode === 'MANUAL' && (
          <div className="px-4 mb-4">
            <BulkManualQuestionForm 
              mode="QUICK_EXAM"
              isPending={isAddingBulk}
              onSave={(newQs) => { 
                addBulkManual(
                  { questionsData: newQs, folderId: paper?.folderId || '' },
                  {
                    onSuccess: () => {
                      setActiveMode('NONE');
                    }
                  }
                );
              }} 
              onCancel={() => setActiveMode('NONE')} 
            />
          </div>
        )}
        
        {!isPublished && activeMode === 'IMPORT' && (
          <div className="px-4 mb-4 relative"><ImportDocxModal paperId={paperId} /><Button variant="ghost" className="absolute top-2 right-2 text-slate-400" onClick={() => setActiveMode('NONE')}>Đóng</Button></div>
        )}

        <div className={`flex flex-1 overflow-hidden transition-all ${activeMode === 'BANK' ? 'px-0' : 'px-4'}`}>

          <div className={`h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 transition-all ${activeMode === 'BANK' ? 'w-[70%] px-6 pb-20 border-r bg-slate-50/50' : 'w-full'}`}>
            <div className="flex items-center gap-2 text-slate-400 mb-4"><FileText className="w-5 h-5" /><h2 className="font-bold uppercase tracking-widest text-sm">Cấu trúc tờ đề ({localQuestions.length} câu)</h2></div>

            <SortableContext
              items={displayQuestions.map((q, index) => String(q.originalQuestionId || q._id || `fallback-${index}`))}
              strategy={verticalListSortingStrategy}
            >
              {/* 4. SỬ DỤNG DroppableBoardArea THAY CHO <div> THƯỜNG, ĐẶT min-h-[500px] */}
              <DroppableBoardArea id="exam-board-droppable-area" className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[500px]">
                {displayQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                    <FileText className="w-16 h-16 mb-4" />
                    <p>Chưa có câu hỏi nào trong đề thi.</p>
                    <p className="text-sm">Hãy chọn câu hỏi từ Ngân hàng hoặc Thêm mới</p>
                  </div>
                ) : (
                  displayQuestions.map((q, index) => {

                    const safeKey = String(q.originalQuestionId || q._id || `fallback-${index}`);

                    return (
                      <SortableQuestionCard
                        key={safeKey}
                        question={q}
                        answerKeys={paper?.answerKeys || []}
                        isPublished={isPublished}
                        onEdit={() => setSelectedEditQuestion(q)}
                        onRemove={() => handleRemove(q.originalQuestionId)}
                      />
                    );
                  })
                )}
              </DroppableBoardArea>
            </SortableContext>
          </div>

          {activeMode === 'BANK' && (
            <div className="w-[30%] h-full shrink-0 bg-white animate-in slide-in-from-right-10 duration-300">
              <MiniBankSidebar existingQuestionIds={existingQuestionIds} />
            </div>
          )}
        </div>

      </div>

      <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeDragItem ? (
          activeDragItem.id.toString().startsWith('bank-') ? (
            <div className="opacity-95 scale-105 rotate-2 cursor-grabbing pointer-events-none w-80 shadow-2xl">
              {/* 5. DÙNG MiniQuestionCardUI TRONG OVERLAY ĐỂ KHÔNG BỊ XUNG ĐỘT HOOK */}
              <MiniQuestionCardUI question={activeDragItem.data.current?.questionData} />
            </div>
          ) : (
            <div className="opacity-80 scale-105 cursor-grabbing pointer-events-none bg-white border-2 border-blue-400 p-6 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3 text-blue-600 font-bold">
                <GripVertical className="w-5 h-5" /> Đang di chuyển câu hỏi...
              </div>
            </div>
          )
        ) : null}
      </DragOverlay>

      <EditQuestionSheet question={selectedEditQuestion} answerKeys={paper?.answerKeys || []} paperId={paperId || ''} onClose={() => setSelectedEditQuestion(null)} />
    </DndContext>
  );
}