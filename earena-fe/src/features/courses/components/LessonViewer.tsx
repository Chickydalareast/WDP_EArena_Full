'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/config/routes';
import { useLessonContent, useStudyTree, useMarkLessonCompleted, useRefreshLessonToken } from '../hooks/useStudyRoom';
import { VideoPlayer } from '@/shared/components/ui/video-player';

import dynamic from 'next/dynamic';
const DocumentViewer = dynamic(
  () => import('@/shared/components/ui/document-viewer').then((mod) => mod.DocumentViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full w-full gap-4 bg-slate-900/5 dark:bg-black/20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">Đang khởi tạo trình xem PDF...</p>
      </div>
    )
  }
);

import { Skeleton } from '@/shared/components/ui/skeleton';
import { Button } from '@/shared/components/ui/button';
import { CheckCircle2, Play, FileText, BrainCircuit, Loader2, Download, Lock, AlertCircle, Eye, X } from 'lucide-react';
import { toast } from 'sonner';

// --- IMPORTS MỚI CHO EXAM ENGINE ---
import { StudentExamEngine } from '@/features/exam-taking/components/StudentExamEngine';
import { useExamReview } from '@/features/exam-taking/hooks/useTakeExam';

interface LessonViewerProps {
  courseId: string;
  lessonId: string;
}

// 1. Khởi tạo type cho State Machine của Quiz
type QuizViewState = 'PREVIEW' | 'TAKING' | 'RESULT';

export function LessonViewer({ courseId, lessonId }: LessonViewerProps) {
  const router = useRouter();

  const { data: lessonContent, isLoading: isLoadingContent, isError, isFetching } = useLessonContent(courseId, lessonId);
  const { data: studyTree } = useStudyTree(courseId);
  const { mutate: markCompleted, isPending: isMarking } = useMarkLessonCompleted(courseId);
  const { refreshToken } = useRefreshLessonToken();

  // Local state điều khiển Bento Box hiển thị tài liệu
  const [activeAttachmentId, setActiveAttachmentId] = useState<string | null>(null);

  // 2. State Machine cho riêng Quiz
  const [quizState, setQuizState] = useState<QuizViewState>('PREVIEW');
  const [completedSubmissionId, setCompletedSubmissionId] = useState<string | null>(null);

  const lessonMeta = useMemo(() => {
    if (!studyTree || !lessonId) return null;
    return studyTree.curriculum.sections
      .flatMap(s => s.lessons)
      .find(l => l.id === lessonId);
  }, [studyTree, lessonId]);

  // Thuật toán O(N) tìm bài học tiếp theo (Next Lesson)
  const nextLessonId = useMemo(() => {
    if (!studyTree || !lessonId) return null;
    const allLessons = studyTree.curriculum.sections.flatMap(s => s.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    return allLessons[currentIndex + 1]?.id || null;
  }, [studyTree, lessonId]);

  // Derived state: Lấy object tài liệu LUÔN MỚI NHẤT từ React Query cache
  const activeAttachment = useMemo(() => {
    if (!activeAttachmentId || !lessonContent?.attachments) return null;
    return lessonContent.attachments.find(a => a.id === activeAttachmentId) || null;
  }, [activeAttachmentId, lessonContent?.attachments]);

  if (isLoadingContent) {
    return (
      <div className="p-6 md:p-10 space-y-8 w-full max-w-5xl mx-auto">
        <Skeleton className="w-full aspect-video rounded-xl" />
        <Skeleton className="h-10 w-2/3 rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !lessonContent || !lessonMeta) return <ErrorState />;

  const handleMarkCompleted = () => {
    if (!lessonMeta.isCompleted) {
      markCompleted(lessonId, {
        onSuccess: () => {
          toast.success('Đã ghi nhận tiến độ học tập!');
        }
      });
    }
  };

  // 3. Hàm xử lý chuyển bài học sau khi xem kết quả
  const handleGoToNextLesson = () => {
    if (nextLessonId) {
      // Điều hướng UI (thay đổi params url mà không làm tải lại trang)
      router.push(ROUTES.STUDENT.STUDY_ROOM(courseId) + `?lessonId=${nextLessonId}`);
      // Reset State cho bài mới
      setQuizState('PREVIEW');
      setCompletedSubmissionId(null);
    } else {
      toast.success('Chúc mừng! Bạn đã hoàn thành bài học cuối cùng của khóa.');
    }
  };

  const isQuiz = !!lessonContent.examId;
  const hasVideo = !!lessonContent.primaryVideo;
  const rules = (lessonContent as any).examRules;

  return (
    <div className="flex flex-col h-full bg-background pb-12">

      {/* --- LAYER 1: TÀI NGUYÊN CHÍNH (VIDEO / QUIZ / LOCKED) --- */}
      {(hasVideo || isQuiz) && (
        <div
          className="w-full bg-slate-950/5 dark:bg-black p-0 md:p-6 lg:p-8 flex-shrink-0 flex flex-col gap-8 items-center justify-center border-b border-border/50"
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Hiển thị Video nếu có */}
          {hasVideo && lessonContent.primaryVideo && (
            lessonContent.primaryVideo.url ? (
              <div className="w-full max-w-5xl mx-auto">
                <VideoPlayer
                  src={lessonContent.primaryVideo.url}
                  isRefetching={isFetching}
                  onTokenExpired={() => refreshToken(courseId, lessonId)}
                  poster={lessonContent.primaryVideo.blurHash}
                />
              </div>
            ) : (
              <LockedMediaState type="video" />
            )
          )}

          {/* MÁY TRẠNG THÁI CHO QUIZ (IN-PLACE) */}
          {isQuiz && (
            <div className="w-full max-w-5xl mx-auto shadow-sm">
              
              {/* STATE 1: PREVIEW */}
              {quizState === 'PREVIEW' && (
                <div className="bg-card border-2 border-border border-dashed rounded-xl p-8 text-center transition-all animate-in fade-in duration-500">
                  <BrainCircuit className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-3xl font-black mb-3 text-foreground tracking-tight">Bài Kiểm Tra Trắc Nghiệm</h3>
                  <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-muted-foreground mb-8 bg-muted/30 p-4 rounded-lg inline-flex">
                    <span className="flex items-center gap-2">⏳ Thời gian: {rules?.timeLimit === 0 ? 'Không giới hạn' : `${rules?.timeLimit} phút`}</span>
                    <span className="flex items-center gap-2">🎯 Điểm qua: {rules?.passPercentage}%</span>
                    <span className="flex items-center gap-2">🔄 Lượt làm: {rules?.maxAttempts || 'Không giới hạn'} lần</span>
                  </div>
                  <div className="block">
                    <Button size="lg" onClick={() => setQuizState('TAKING')} className="font-bold h-14 px-10 text-lg shadow-md hover:scale-105 transition-transform">
                      Bắt đầu làm bài ngay
                    </Button>
                  </div>
                </div>
              )}

              {/* STATE 2: TAKING (Nhúng Engine) */}
              {quizState === 'TAKING' && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                  <StudentExamEngine 
                    courseId={courseId} 
                    lessonId={lessonId}
                    onComplete={(subId) => {
                      setCompletedSubmissionId(subId);
                      setQuizState('RESULT');
                    }} 
                  />
                </div>
              )}

              {/* STATE 3: RESULT */}
              {quizState === 'RESULT' && completedSubmissionId && (
                <div className="animate-in zoom-in-95 duration-500">
                  <QuizResultView 
                    submissionId={completedSubmissionId} 
                    onNextLesson={handleGoToNextLesson}
                    hasNext={!!nextLessonId}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- LAYER 2: METADATA & ACTION --- */}
      <div className="p-6 md:px-8 flex-1 max-w-5xl mx-auto w-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">{lessonMeta.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
              <div className="flex items-center gap-2 bg-muted/60 text-muted-foreground px-3 py-1.5 rounded-md border border-border/50">
                {isQuiz ? <BrainCircuit className="w-4 h-4 text-purple-500" /> :
                  hasVideo ? <Play className="w-4 h-4 text-blue-500" /> :
                    <FileText className="w-4 h-4 text-orange-500" />}
                <span>
                  {isQuiz ? 'Bài trắc nghiệm' : hasVideo ? 'Video bài giảng' : 'Lý thuyết / Ghi chú'}
                </span>
              </div>
              {lessonMeta.isFreePreview && (
                <span className="bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider">
                  Học thử
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            {!isQuiz ? (
              <Button
                onClick={handleMarkCompleted}
                disabled={lessonMeta.isCompleted || isMarking}
                variant={lessonMeta.isCompleted ? 'secondary' : 'default'}
                className={`w-full md:w-auto font-bold h-12 px-6 transition-all ${lessonMeta.isCompleted ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-700 border border-green-200/50' : ''}`}
              >
                {isMarking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {lessonMeta.isCompleted ? (
                  <><CheckCircle2 className="w-5 h-5 mr-2" /> Đã hoàn thành</>
                ) : (
                  'Đánh dấu hoàn thành'
                )}
              </Button>
            ) : (
              <div className="bg-muted/30 p-3.5 rounded-xl border border-border/50 text-sm flex items-center justify-center md:justify-start gap-2 shadow-sm">
                {lessonMeta.isCompleted ? (
                  <><CheckCircle2 className="w-5 h-5 text-green-500" /> <span className="font-bold text-green-700 dark:text-green-400">Đã qua bài thi</span></>
                ) : (
                  <span className="text-muted-foreground font-medium">Bạn cần hoàn thành bài thi để qua bài.</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* --- LAYER 3: RICH TEXT CONTENT --- */}
        {lessonContent.content && lessonContent.content !== '<p></p>' && (
          <div className="pt-6 border-t border-border/40">
            <h3 className="text-lg font-bold mb-4 text-foreground">Nội dung bài học</h3>
            <div
              className="prose prose-sm md:prose-base dark:prose-invert max-w-none bg-card p-6 rounded-2xl border border-border/40 shadow-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: lessonContent.content }}
            />
          </div>
        )}

        {/* --- LAYER 4: ATTACHMENTS (NÂNG CẤP BENTO SECTION MỚI) --- */}
        {lessonContent.attachments && lessonContent.attachments.length > 0 && (
          <div className="pt-6 border-t border-border/40">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-orange-500" /> Tài liệu đính kèm (PDF/DOCX)
            </h3>

            {/* Grid danh sách các nút bấm tài liệu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {lessonContent.attachments.map((file) => (
                file.url ? (
                  <button
                    key={file.id}
                    onClick={() => setActiveAttachmentId(file.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all group text-left outline-none focus-visible:ring-2 ring-primary ${activeAttachmentId === file.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-muted/20 hover:bg-muted/50'
                      }`}
                  >
                    <FileIcon />
                    <div className="flex-1 min-w-0">
                      <span className={`font-medium text-sm truncate block transition-colors ${activeAttachmentId === file.id ? 'text-primary' : 'text-foreground group-hover:text-orange-600'}`} title={file.originalName}>
                        {file.originalName}
                      </span>
                      {file.size && <span className="text-[10px] text-muted-foreground block mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</span>}
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded border transition-colors ${activeAttachmentId === file.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground group-hover:text-orange-500 border-border/50'
                      }`}>
                      <Eye className="w-3.5 h-3.5" /> Xem
                    </div>
                  </button>
                ) : (
                  <div key={file.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-border/50 bg-muted/10 opacity-70 cursor-not-allowed">
                    <Lock className="w-5 h-5 text-muted-foreground/60 flex-shrink-0" />
                    <span className="font-medium text-sm truncate flex-1 text-muted-foreground" title={file.originalName}>{file.originalName}</span>
                  </div>
                )
              ))}
            </div>

            {/* Khối Inline Document Viewer (Bento Style) */}
            {activeAttachment && activeAttachment.url && (
              <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 ring-1 ring-primary/20">
                <div className="flex items-center justify-between p-3 px-4 bg-muted/40 border-b border-border">
                  <span className="font-semibold text-sm text-foreground flex items-center gap-2 truncate pr-4">
                    <Eye className="w-4 h-4 text-primary shrink-0" /> Đang xem: <span className="truncate">{activeAttachment.originalName}</span>
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setActiveAttachmentId(null)} className="shrink-0 h-8 gap-1.5 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" /> Thu gọn
                  </Button>
                </div>

                <div className="h-[75vh] w-full bg-slate-900/5 dark:bg-black/20">
                  <DocumentViewer
                    url={activeAttachment.url}
                    originalName={activeAttachment.originalName}
                    isRefetching={isFetching}
                    onTokenExpired={() => refreshToken(courseId, lessonId)}
                    className="border-none rounded-none shadow-none h-full"
                  />
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

// === COMPONENT: MÀN HÌNH KẾT QUẢ ĐIỂM SỐ NHÚNG TRONG ===
function QuizResultView({ submissionId, onNextLesson, hasNext }: { submissionId: string, onNextLesson: () => void, hasNext: boolean }) {
  const { data: result, isLoading, isError } = useExamReview(submissionId);

  if (isLoading || !result) {
    return (
      <div className="p-12 text-center bg-card border rounded-xl">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary mb-4" />
        <p className="font-semibold text-muted-foreground">Đang tải dữ liệu bài thi...</p>
      </div>
    );
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500 font-bold bg-red-50 rounded-xl">Lỗi kết nối khi lấy điểm. Vui lòng F5 lại trang!</div>;
  }

  // [CTO FIX]: Handle State Polling - Hiển thị trạng thái đang chấm từ Backend
  if (result.status === 'GRADING_IN_PROGRESS') {
    return (
      <div className="bg-card border rounded-xl p-12 text-center space-y-4 animate-in fade-in duration-500">
         <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
            <BrainCircuit className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
         </div>
         <h3 className="font-bold text-xl text-slate-800">Đang tự động chấm điểm</h3>
         <p className="text-sm font-medium text-slate-500 animate-pulse">
           {result.message || 'Vui lòng không thoát trang. Kết quả sẽ có trong giây lát...'}
         </p>
      </div>
    );
  }

  // Màn hình khi trạng thái là COMPLETED (Chấm xong)
  const score = result.summary?.score || 0;
  const isPassed = (score / 10) * 100 >= 50; // Tạm fix 50% theo thang 10

  return (
    <div className="bg-card border rounded-xl p-8 text-center space-y-6 animate-in zoom-in-95 duration-500">
       <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center shadow-inner ${isPassed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
         {isPassed ? <CheckCircle2 className="w-12 h-12" /> : <X className="w-12 h-12" />}
       </div>
       
       <div>
         <h2 className="text-4xl font-black mb-2">
           <span className={isPassed ? 'text-green-600' : 'text-red-600'}>{score.toFixed(1)}</span>
           <span className="text-2xl text-slate-400"> / 10</span>
         </h2>
         <p className="text-muted-foreground mt-2 font-medium">
           Bạn đã trả lời đúng {result.summary?.correctCount}/{result.summary?.totalQuestions} câu hỏi.
         </p>
       </div>
       
       <div className="flex justify-center gap-4 pt-6 border-t border-border/50">
         <Button variant="outline" size="lg" onClick={() => window.location.reload()}>
            Làm lại bài thi
         </Button>
         <Button size="lg" onClick={onNextLesson} className="bg-primary font-bold px-8 shadow-md">
           {hasNext ? 'Học bài tiếp theo' : 'Hoàn thành khóa học'}
         </Button>
       </div>
    </div>
  );
}

function LockedMediaState({ type }: { type: 'video' | 'document' }) {
  return (
    <div className="flex flex-col items-center justify-center aspect-video w-full max-w-5xl mx-auto bg-card border-2 border-border border-dashed rounded-xl p-6 text-center shadow-sm">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
        <Lock className="w-10 h-10 text-muted-foreground/60" />
      </div>
      <h3 className="text-2xl font-bold mb-3 text-foreground">Nội dung đã bị khóa</h3>
      <p className="text-muted-foreground mb-8 max-w-md">
        {type === 'video' ? 'Video bài giảng này' : 'Nội dung này'} thuộc chương trình học cao cấp. Vui lòng ghi danh khóa học để mở khóa toàn bộ tài nguyên.
      </p>
      <Button size="lg" variant="default" className="font-bold" onClick={() => window.history.back()}>
        Quay lại trang thông tin
      </Button>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <p className="text-destructive font-semibold text-lg">Không thể tải nội dung bài học.</p>
      <p className="text-muted-foreground">Vui lòng tải lại trang hoặc liên hệ hỗ trợ kỹ thuật.</p>
    </div>
  );
}

function FileIcon() {
  return (
    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
      <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
    </div>
  );
}