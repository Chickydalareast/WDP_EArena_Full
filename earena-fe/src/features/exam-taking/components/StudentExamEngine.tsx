'use client';

import React, { useEffect, useState, memo, useRef, useMemo, useCallback } from 'react';
import { useGetExamPaper, useAutoSave, useSubmitExam } from '../hooks/useTakeExam';
import { useExamTakingStore } from '../stores/exam-taking.store';
import { Clock, Send, Loader2, CheckCircle2, Lock, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import { groupExamQuestions, NestedExamQuestion } from '../lib/exam-taking-utils';
import { StudentExamQuestion } from '../types/exam-take.schema';
import { ROUTES } from '@/config/routes';

// ==========================================
// 1. PROPS CHUẨN (SAU KHI NHẤC START EXAM LÊN CHA)
// ==========================================
interface StudentExamEngineProps {
  courseId: string;
  lessonId: string;
  submissionId: string; // Bắt buộc nhận từ URL/Parent
  onComplete: (submissionId: string) => void;
}

// ==========================================
// 2. SUB-COMPONENTS (TỐI ƯU RENDER & POLYMORPHISM)
// ==========================================

// --- TIMER COMPONENT ---
const ExamTimer = memo(({ startedAt, timeLimit, onTimeUp }: { startedAt: string; timeLimit: number; onTimeUp: () => void }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const isTimeUpRef = useRef(false);

  useEffect(() => {
    if (timeLimit === 0) return;

    // Tính EndTime = Bắt đầu + Giới hạn (Phút)
    const endTime = new Date(startedAt).getTime() + (timeLimit * 60 * 1000);

    const timer = setInterval(() => {
      const remain = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remain);

      // Nếu hết giờ, tự động kích hoạt nộp bài (BE đã có 60s Network Buffer)
      if (remain <= 0 && !isTimeUpRef.current) {
        isTimeUpRef.current = true;
        clearInterval(timer);
        toast.error('Đã hết thời gian làm bài!', { description: 'Hệ thống đang tự động thu bài...' });
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startedAt, timeLimit, onTimeUp]);

  if (timeLimit === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm font-bold shadow-inner bg-muted text-muted-foreground">
        <Clock className="w-5 h-5" /> Không giới hạn
      </div>
    );
  }

  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl font-bold shadow-inner transition-colors ${timeLeft < 300 ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-primary/10 text-primary'}`}>
      <Clock className="w-5 h-5" />
      {m}:{s}
    </div>
  );
});
ExamTimer.displayName = 'ExamTimer';

// --- QUESTION CARD COMPONENT (ĐA HÌNH: ĐƠN HOẶC ĐOẠN VĂN) ---
const QuestionCard = memo(({ 
  node, 
  globalIndexOffset, 
  isSubmittingUI, 
  onSelect 
}: { 
  node: NestedExamQuestion, 
  globalIndexOffset: number, 
  isSubmittingUI: boolean, 
  onSelect: (qId: string, aId: string) => void 
}) => {

  // Nếu là câu Đọc Hiểu (Passage Mother) -> Render khung Đoạn văn + Gọi đệ quy render câu con
  if (node.type === 'PASSAGE') {
    return (
      <div className="bg-card p-6 md:p-8 rounded-2xl border-2 border-border shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-primary font-bold mb-2 bg-primary/10 w-fit px-4 py-1.5 rounded-lg">
          <FileText className="w-5 h-5" /> Dựa vào đoạn văn sau để trả lời các câu hỏi:
        </div>
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground leading-relaxed bg-muted/30 p-5 rounded-xl border border-border/50" dangerouslySetInnerHTML={{ __html: node.content }} />
        
        <div className="space-y-4 pt-4">
          {node.subQuestions?.map((subQ, idx) => (
            <QuestionCard 
              key={subQ.originalQuestionId} 
              node={subQ} 
              globalIndexOffset={globalIndexOffset + idx} 
              isSubmittingUI={isSubmittingUI} 
              onSelect={onSelect} 
            />
          ))}
        </div>
      </div>
    );
  }

  // Câu hỏi thường (Flat / Sub-question)
  // [CTO TỐI ƯU]: Chỉ re-render câu hỏi nếu đúng câu này được chọn (nhờ Zustand selector)
  const selectedAnswerId = useExamTakingStore(state => state.answers[node.originalQuestionId]);

  return (
    <div id={`question-${node.originalQuestionId}`} className="bg-card p-6 rounded-2xl border border-border shadow-sm relative transition-all hover:border-primary/40 group">
      <div className="absolute -left-3 -top-3 w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold shadow-md transform transition-transform group-hover:scale-110">
        {globalIndexOffset + 1}
      </div>
      <div className="ml-2 mt-2">
        <div className="text-base md:text-lg font-medium text-foreground mb-6 whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: node.content }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {node.answers.map((ans) => {
            const isChecked = selectedAnswerId === ans.id;
            return (
              <label
                key={ans.id}
                className={`flex items-start p-3.5 border-2 rounded-xl cursor-pointer transition-all ${isChecked ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/60 hover:border-primary/30 bg-background'}`}
              >
                <input
                  type="radio"
                  name={`question-${node.originalQuestionId}`}
                  value={ans.id}
                  checked={isChecked}
                  onChange={() => onSelect(node.originalQuestionId, ans.id)}
                  disabled={isSubmittingUI}
                  className="mt-1 w-4 h-4 text-primary bg-background border-border focus:ring-primary/50 transition-transform hover:scale-110"
                />
                <div className="ml-3 flex-1">
                  <span className={`font-bold mr-2 ${isChecked ? 'text-primary' : 'text-muted-foreground'}`}>{ans.id}.</span>
                  <span className="text-foreground">{ans.content}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
});
QuestionCard.displayName = 'QuestionCard';


const NavigatorItem = memo(({ qId, index }: { qId: string, index: number }) => {
  const isAnswered = !!useExamTakingStore(state => state.answers[qId]);
  return (
    <button
      onClick={() => {
        const el = document.getElementById(`question-${qId}`);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }}
      className={`h-10 rounded-lg font-bold text-sm border-2 transition-all hover:-translate-y-1 ${isAnswered ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20' : 'bg-background text-muted-foreground border-border hover:border-primary/50'}`}
    >
      {index + 1}
    </button>
  );
});
NavigatorItem.displayName = 'NavigatorItem';

// ==========================================
// 3. MAIN COMPONENT (DUMB FETCHING COMPONENT)
// ==========================================
export function StudentExamEngine({ courseId, lessonId, submissionId, onComplete }: StudentExamEngineProps) {
  
  // 1. Khởi tạo Hook Fetch Đề & Mutation
  const { data: paperResponse, isLoading: isLoadingPaper, isError } = useGetExamPaper(submissionId);
  const { mutate: autoSave } = useAutoSave(submissionId);
  const { mutateAsync: submitExam } = useSubmitExam(submissionId);

  const { initExamSession, selectAnswer, clearSession } = useExamTakingStore();
  const totalAnswered = useExamTakingStore(state => Object.keys(state.answers).filter(k => state.answers[k]).length);

  const [isSubmittingUI, setIsSubmittingUI] = useState(false);
  const isHydrated = useRef(false);

  // 2. Tiền xử lý dữ liệu (Cây Đọc hiểu & Tìm câu làm được)
  const nestedQuestionsTree = useMemo(() => {
    if (!paperResponse?.questions) return [];
    return groupExamQuestions(paperResponse.questions);
  }, [paperResponse?.questions]);

  const answerableQuestions = useMemo(() => {
    if (!paperResponse?.questions) return [];
    // Các câu hỏi khoanh được là những câu KHÔNG phải loại PASSAGE
    return paperResponse.questions.filter(q => q.type !== 'PASSAGE');
  }, [paperResponse?.questions]);

  // 3. Phục hồi State từ Redis Backend (Hydration)
  useEffect(() => {
    if (paperResponse && !isHydrated.current) {
      initExamSession(submissionId, { courseId, lessonId }, paperResponse.questions);
      isHydrated.current = true;
    }
  }, [paperResponse, submissionId, courseId, lessonId, initExamSession]);

  // 4. Action Handlers
  const handleAnswerSelect = useCallback((questionId: string, answerId: string) => {
    if (isSubmittingUI) return;
    
    // Cập nhật UI ngay lập tức
    selectAnswer(questionId, answerId);
    
    // Gọi ngầm API (Background Save)
    autoSave({ questionId, selectedAnswerId: answerId });
  }, [isSubmittingUI, selectAnswer, autoSave]);

  const executeSubmit = async () => {
    setIsSubmittingUI(true);
    try {
      await submitExam();
      clearSession();
      onComplete(submissionId); 
    } catch (error) {
      setIsSubmittingUI(false);
    }
  };

  if (isError) {
    return (
      <div className="w-full bg-destructive/5 rounded-xl border border-destructive/20 py-16 flex flex-col items-center justify-center animate-in fade-in duration-500">
        <Lock className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-foreground">Không thể truy cập đề thi</h2>
        <p className="text-muted-foreground mt-2">Bài thi đã kết thúc hoặc phiên làm bài không tồn tại.</p>
        <Button onClick={() => window.location.href = ROUTES.STUDENT.STUDY_ROOM(courseId)} className="mt-6">Quay lại bài học</Button>
      </div>
    );
  }

  if (isLoadingPaper || !paperResponse) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-card rounded-xl border border-border shadow-sm">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
        <h2 className="text-2xl font-bold text-foreground">Đang giải mã cấu trúc đề thi...</h2>
        <p className="text-muted-foreground mt-2 font-medium">Bạn đã sẵn sàng bứt phá chưa?</p>
      </div>
    );
  }

  // --- RENDER 3: GIAO DIỆN LÀM BÀI CHÍNH ---
  let globalQIndex = 0; // Bộ đếm tuyến tính cho giao diện

  return (
    <div className="w-full min-h-screen bg-background rounded-xl overflow-hidden relative">
      {/* TOOLBAR */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border px-4 py-4 md:px-8 flex justify-between items-center shadow-sm">
        <h1 className="text-lg font-black text-foreground hidden md:block">
          Phiên thi: <span className="text-primary font-mono">{submissionId.slice(-6).toUpperCase()}</span>
        </h1>
        <div className="flex items-center gap-4 ml-auto">
          <ExamTimer 
            startedAt={paperResponse.startedAt} 
            timeLimit={paperResponse.timeLimit} 
            onTimeUp={executeSubmit} 
          />
          <Button
            onClick={() => window.confirm('Bạn có chắc chắn muốn nộp bài sớm không?') && executeSubmit()}
            disabled={isSubmittingUI}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95"
          >
            {isSubmittingUI ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
            NỘP BÀI
          </Button>
        </div>
      </header>

      {/* OVERLAY KHI ĐANG NỘP */}
      {isSubmittingUI && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center transition-all">
          <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-4 border-orange-500 animate-spin animation-delay-150"></div>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
            Đang niêm phong bài thi...
          </h2>
          <p className="text-muted-foreground font-medium mt-4 text-lg bg-muted px-4 py-2 rounded-full">
            Tuyệt đối <strong className="text-destructive">KHÔNG F5</strong> trình duyệt lúc này!
          </p>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 xl:grid-cols-12 gap-8 max-w-[1400px] mx-auto">
        
        {/* CỘT CÂU HỎI */}
        <div className="xl:col-span-8 space-y-8">
          {nestedQuestionsTree.map((node) => {
            const currentOffset = globalQIndex;
            // Tăng bộ đếm dựa trên số lượng câu hỏi con (hoặc 1 nếu là câu đơn)
            if (node.type === 'PASSAGE' && node.subQuestions) {
              globalQIndex += node.subQuestions.length;
            } else {
              globalQIndex += 1;
            }

            return (
              <QuestionCard
                key={node.originalQuestionId}
                node={node}
                globalIndexOffset={currentOffset}
                isSubmittingUI={isSubmittingUI}
                onSelect={handleAnswerSelect}
              />
            );
          })}
        </div>

        {/* CỘT NAVIGATOR (BẢNG ĐIỀU KHIỂN) */}
        <div className="xl:col-span-4">
          <div className="sticky top-28 bg-card p-6 rounded-2xl border shadow-sm ring-1 ring-border/50">
            <h3 className="font-bold text-foreground mb-6 flex items-center gap-2 text-lg">
              <CheckCircle2 className="w-6 h-6 text-green-500" /> Tổng quan bài làm
            </h3>

            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-3 mb-8 overflow-hidden shadow-inner">
              <div
                className="bg-primary h-full rounded-full transition-all duration-700 ease-out relative"
                style={{ width: answerableQuestions.length ? `${(totalAnswered / answerableQuestions.length) * 100}%` : '0%' }}
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 md:gap-3">
              {/* Lặp qua mảng câu hỏi làm được (bỏ qua Passage) để map đúng số thự tự và ID */}
              {answerableQuestions.map((q: StudentExamQuestion, index: number) => (
                <NavigatorItem key={q.originalQuestionId} qId={q.originalQuestionId} index={index} />
              ))}
            </div>

            <div className="mt-8 pt-6 border-t flex justify-between items-center text-sm font-medium">
              <span className="text-muted-foreground">Tiến độ hoàn thành:</span>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
                {totalAnswered} / {answerableQuestions.length} câu
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}