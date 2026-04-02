'use client';

import React, { useEffect, useState, memo, useRef } from 'react';
import { useStartExam, useAutoSave, useSubmitExam } from '../hooks/useTakeExam';
import { useExamTakingStore } from '../stores/exam-taking.store';
import { Clock, Send, Loader2, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';

// ==========================================
// 1. ĐỊNH NGHĨA PROPS TINH GỌN (MOOC CONTEXT)
// ==========================================
interface StudentExamEngineProps {
  courseId: string;
  lessonId: string;
  onComplete: (submissionId: string) => void; // Call ngược ra cha khi nộp xong
}

interface ExamQuestion {
  originalQuestionId: string;
  content: string;
  answers: Array<{ id: string; content: string }>;
}

interface ExamPaperData {
  code: string;
  questions: ExamQuestion[];
}

// ==========================================
// 2. SUB-COMPONENTS (Tối ưu render)
// ==========================================

// === TIMER TUYỆT ĐỐI (ABSOLUTE TIME) CHUẨN BE SPEC ===
const ExamTimer = memo(({ startedAt, timeLimit, onTimeUp }: { startedAt: string; timeLimit: number; onTimeUp: () => void }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const isTimeUpRef = useRef(false);

  useEffect(() => {
    // FE confirm công thức BE: EndTime = startedAt + timeLimit (phút)
    const endTime = new Date(startedAt).getTime() + (timeLimit * 60 * 1000);

    const timer = setInterval(() => {
      const remain = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remain);

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
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm font-bold shadow-inner bg-slate-100 text-slate-500">
        <Clock className="w-5 h-5" /> Không giới hạn
      </div>
    );
  }

  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl font-bold shadow-inner ${timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-800'}`}>
      <Clock className="w-5 h-5" />
      {m}:{s}
    </div>
  );
});
ExamTimer.displayName = 'ExamTimer';

const QuestionCard = memo(({ q, index, isSubmittingUI, onSelect }: { q: ExamQuestion, index: number, isSubmittingUI: boolean, onSelect: (qId: string, aId: string) => void }) => {
  const selectedAnswerId = useExamTakingStore(state => state.answers[q.originalQuestionId]);

  return (
    <div id={`question-${index}`} className="bg-white p-6 rounded-2xl border shadow-sm relative hover:border-blue-200 transition-colors">
      <div className="absolute -left-3 top-6 w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold shadow-lg">
        {index + 1}
      </div>
      <div className="ml-6">
        <p className="text-lg font-medium text-slate-800 mb-6 whitespace-pre-wrap leading-relaxed">{q.content}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {q.answers.map((ans) => {
            const isChecked = selectedAnswerId === ans.id;
            return (
              <label
                key={ans.id}
                className={`flex items-start p-3 border-2 rounded-xl cursor-pointer transition-all ${isChecked ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 hover:border-blue-200 bg-white'}`}
              >
                <input
                  type="radio"
                  name={`question-${q.originalQuestionId}`}
                  value={ans.id}
                  checked={isChecked}
                  onChange={() => onSelect(q.originalQuestionId, ans.id)}
                  disabled={isSubmittingUI}
                  className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 transition-transform hover:scale-110"
                />
                <div className="ml-3 flex-1">
                  <span className="font-bold mr-2 text-slate-700">{ans.id}.</span>
                  <span className="text-slate-700">{ans.content}</span>
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
      onClick={() => document.getElementById(`question-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
      className={`h-10 rounded-lg font-bold text-sm border-2 transition-all hover:-translate-y-1 ${isAnswered ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
    >
      {index + 1}
    </button>
  );
});
NavigatorItem.displayName = 'NavigatorItem';

// ==========================================
// 3. MAIN COMPONENT NÂNG CẤP (NHÚNG)
// ==========================================
export function StudentExamEngine({ courseId, lessonId, onComplete }: StudentExamEngineProps) {
  const [paperData, setPaperData] = useState<ExamPaperData | null>(null);
  const [examConfig, setExamConfig] = useState<{ timeLimit: number; startedAt: string } | null>(null);
  
  const [isSubmittingUI, setIsSubmittingUI] = useState(false);
  const [accessError, setAccessError] = useState<{ isLocked: boolean; message: string }>({ isLocked: false, message: '' });

  const { submissionId, initExamSession, selectAnswer, clearSession } = useExamTakingStore();
  const totalAnswered = useExamTakingStore(state => Object.keys(state.answers).filter(k => state.answers[k]).length);

  const { mutateAsync: startExam, isPending: isStarting } = useStartExam();
  const { mutate: autoSave } = useAutoSave(submissionId);
  const { mutateAsync: submitExam } = useSubmitExam(submissionId);

  useEffect(() => {
    let isMounted = true; // Cờ kiểm soát vòng đời component
    
    // [CTO FIX]: Khử triệt để Strict Mode bằng cơ chế Debounce Mount
    const timer = setTimeout(() => {
      const init = async () => {
        try {
          const res = await startExam({ courseId, lessonId });
          
          if (!isMounted) return; // Nếu component đã bị hủy bởi Strict Mode -> Hủy set state

          if (!res || !res.submissionId || !res.startedAt) {
            throw new Error('Dữ liệu phiên thi trả về bị lỗi cấu trúc từ máy chủ.');
          }

          setExamConfig({ timeLimit: res.timeLimit || 0, startedAt: res.startedAt });
          
          initExamSession(
            res.submissionId, 
            res.paper?.code || 'DEFAULT', // [CTO FIX]: Fallback an toàn do BE không trả về code
            { courseId, lessonId },
            res.savedAnswers || []
          );
          
          setPaperData(res.paper || { code: 'DEFAULT', questions: [] });

        } catch (err: unknown) {
          if (!isMounted) return; // Bỏ qua thông báo lỗi nếu component ảo bị hủy

          const error = err as { statusCode?: number; message?: string };
          
          if (error?.statusCode === 403) {
            setAccessError({ 
              isLocked: true, 
              message: error?.message || 'Bạn không có quyền làm bài thi này. Vui lòng ghi danh khóa học.' 
            });
            return;
          }
          
          toast.error('Lỗi tải bài thi', { description: error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.' });
        }
      };
      
      init();
    }, 300); // Đợi 300ms để React dọn dẹp xong cái Phantom Mount

    return () => {
      isMounted = false;
      clearTimeout(timer); // Vũ khí tối thượng: Hủy ngay request nếu component bị tháo dỡ
    };
  }, [courseId, lessonId, initExamSession, startExam]);

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    if (isSubmittingUI) return;
    selectAnswer(questionId, answerId);
    autoSave({ questionId, selectedAnswerId: answerId });
  };

  const executeSubmit = async () => {
    setIsSubmittingUI(true);
    try {
      await submitExam();
      clearSession();
      // Nhường quyền điều khiển (và Polling nếu có) cho component cha LessonViewer
      onComplete(submissionId!); 
    } catch (error) {
      setIsSubmittingUI(false);
      toast.error('Lỗi mạng khi thu bài, vui lòng thử nộp lại!');
    }
  };

  // --- RENDER 1: MÀN HÌNH KHÓA ---
  if (accessError.isLocked) {
    return (
      <div className="w-full bg-slate-50 rounded-xl border border-slate-200 py-16 flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50">
          <Lock className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Nội Dung Đã Khóa</h2>
        <p className="text-slate-500 font-medium max-w-sm text-center">
          {accessError.message}
        </p>
      </div>
    );
  }

  // --- RENDER 2: LOADING TRẠNG THÁI ---
  if (isStarting || !paperData || !examConfig) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Đang tải mã đề...</h2>
        <p className="text-slate-500 mt-2 text-sm">Vui lòng đợi trong giây lát</p>
      </div>
    );
  }

  const questions = paperData.questions || [];

  // --- RENDER 3: GIAO DIỆN LÀM BÀI CHÍNH (Embedded Layout) ---
  return (
    <div className="w-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200 relative">
      {/* TOOLBAR */}
      <header className="sticky top-0 z-40 bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-lg font-black text-slate-800">
          Mã đề: <span className="text-blue-600">{paperData.code}</span>
        </h1>
        <div className="flex items-center gap-4 sm:gap-6">
          <ExamTimer 
            startedAt={examConfig.startedAt} 
            timeLimit={examConfig.timeLimit} 
            onTimeUp={executeSubmit} 
          />
          <Button
            onClick={() => window.confirm('Bạn có chắc chắn muốn nộp bài sớm không?') && executeSubmit()}
            disabled={isSubmittingUI}
            className="bg-blue-600 hover:bg-blue-700 font-bold shadow-md transition-transform hover:scale-105"
          >
            {isSubmittingUI ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            NỘP BÀI
          </Button>
        </div>
      </header>

      {/* OVERLAY KHI ĐANG NỘP */}
      {isSubmittingUI && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center transition-all">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mb-6" />
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Đang thu bài về máy chủ...
          </h2>
          <p className="text-slate-500 font-medium mt-3 text-base sm:text-lg">Tuyệt đối không F5 trình duyệt lúc này!</p>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* CỘT CÂU HỎI */}
        <div className="lg:col-span-8 space-y-6">
          {questions.map((q: ExamQuestion, i: number) => (
            <QuestionCard
              key={q.originalQuestionId}
              q={q}
              index={i}
              isSubmittingUI={isSubmittingUI}
              onSelect={handleAnswerSelect}
            />
          ))}
        </div>

        {/* CỘT NAVIGATOR */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-white p-6 rounded-2xl border shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> Tiến độ làm bài
            </h3>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mb-6">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: questions.length ? `${(totalAnswered / questions.length) * 100}%` : '0%' }}
              ></div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q: ExamQuestion, i: number) => (
                <NavigatorItem key={q.originalQuestionId} qId={q.originalQuestionId} index={i} />
              ))}
            </div>

            <p className="text-center text-sm text-slate-500 font-medium mt-6">
              Đã khoanh <span className="font-bold text-slate-800">{totalAnswered}</span> / {questions.length} câu
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}