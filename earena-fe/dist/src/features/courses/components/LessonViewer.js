'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonViewer = LessonViewer;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const react_query_1 = require("@tanstack/react-query");
const link_1 = __importDefault(require("next/link"));
const routes_1 = require("@/config/routes");
const useStudyRoom_1 = require("../hooks/useStudyRoom");
const useVideoTracking_1 = require("../hooks/useVideoTracking");
const course_keys_1 = require("../api/course-keys");
const useExamHistory_1 = require("@/features/exam-taking/hooks/useExamHistory");
const video_player_1 = require("@/shared/components/ui/video-player");
const dynamic_1 = __importDefault(require("next/dynamic"));
const utils_1 = require("@/shared/lib/utils");
const DocumentViewer = (0, dynamic_1.default)(() => import('@/shared/components/ui/document-viewer').then((mod) => mod.DocumentViewer), {
    ssr: false,
    loading: () => (<div className="flex flex-col items-center justify-center h-full w-full gap-4 bg-slate-900/5 dark:bg-black/20">
        <lucide_react_1.Loader2 className="w-8 h-8 animate-spin text-primary"/>
        <p className="text-sm font-semibold text-muted-foreground">Đang khởi tạo trình xem PDF...</p>
      </div>)
});
const skeleton_1 = require("@/shared/components/ui/skeleton");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
const StudentExamEngine_1 = require("@/features/exam-taking/components/StudentExamEngine");
const useTakeExam_1 = require("@/features/exam-taking/hooks/useTakeExam");
const error_parser_1 = require("@/shared/lib/error-parser");
function LessonViewer({ courseId, lessonId }) {
    const router = (0, navigation_1.useRouter)();
    const queryClient = (0, react_query_1.useQueryClient)();
    const { data: lessonContent, isLoading: isLoadingContent, isError, isFetching, error } = (0, useStudyRoom_1.useLessonContent)(courseId, lessonId);
    const { data: studyTree } = (0, useStudyRoom_1.useStudyTree)(courseId);
    const { mutate: markCompleted, isPending: isMarking } = (0, useStudyRoom_1.useMarkLessonCompleted)(courseId);
    const { refreshToken } = (0, useStudyRoom_1.useRefreshLessonToken)();
    const { data: historyOverviews, isLoading: isHistoryLoading } = (0, useExamHistory_1.useHistoryOverview)();
    const [activeAttachmentId, setActiveAttachmentId] = (0, react_1.useState)(null);
    const [quizState, setQuizState] = (0, react_1.useState)('PREVIEW');
    const [completedSubmissionId, setCompletedSubmissionId] = (0, react_1.useState)(null);
    const lessonMeta = (0, react_1.useMemo)(() => {
        if (!studyTree || !lessonId)
            return null;
        return studyTree.curriculum.sections
            .flatMap(s => s.lessons)
            .find(l => l.id === lessonId);
    }, [studyTree, lessonId]);
    const examHistory = (0, react_1.useMemo)(() => {
        if (!historyOverviews)
            return null;
        return historyOverviews.find(h => h.lessonId === lessonId) || null;
    }, [historyOverviews, lessonId]);
    const progressData = lessonContent?.progress;
    const initialWatchTime = progressData?.watchTime || 0;
    const initialPosition = progressData?.lastPosition || 0;
    const isCompletedAtLoad = progressData?.isCompleted || lessonMeta?.isCompleted || false;
    const { trackTimeUpdate, flushHeartbeat, accumulatedTimeRef } = (0, useVideoTracking_1.useVideoTracking)(courseId, lessonId, initialWatchTime);
    const handleOptimisticComplete = (0, react_1.useCallback)(() => {
        if (isCompletedAtLoad)
            return;
        const queryKey = course_keys_1.courseQueryKeys.studyTree(courseId);
        queryClient.setQueryData(queryKey, (oldData) => {
            if (!oldData)
                return oldData;
            const newSections = oldData.curriculum.sections.map(section => ({
                ...section,
                lessons: section.lessons.map(lesson => lesson.id === lessonId
                    ? { ...lesson, isCompleted: true }
                    : lesson)
            }));
            const allLessons = newSections.flatMap(s => s.lessons);
            const totalLessons = allLessons.length;
            const completedLessons = allLessons.filter(l => l.isCompleted).length;
            const newProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
            return {
                ...oldData,
                progress: newProgress,
                curriculum: {
                    ...oldData.curriculum,
                    sections: newSections
                }
            };
        });
        sonner_1.toast.success('Đã tự động ghi nhận tiến độ bài học!');
    }, [courseId, lessonId, isCompletedAtLoad, queryClient]);
    const nextLessonId = (0, react_1.useMemo)(() => {
        if (!studyTree || !lessonId)
            return null;
        const allLessons = studyTree.curriculum.sections.flatMap(s => s.lessons);
        const currentIndex = allLessons.findIndex(l => l.id === lessonId);
        return allLessons[currentIndex + 1]?.id || null;
    }, [studyTree, lessonId]);
    const activeAttachment = (0, react_1.useMemo)(() => {
        if (!activeAttachmentId || !lessonContent?.attachments)
            return null;
        return lessonContent.attachments.find(a => a.id === activeAttachmentId) || null;
    }, [activeAttachmentId, lessonContent?.attachments]);
    if (isLoadingContent) {
        return (<div className="p-6 md:p-10 space-y-8 w-full max-w-5xl mx-auto">
        <skeleton_1.Skeleton className="w-full aspect-video rounded-xl"/>
        <skeleton_1.Skeleton className="h-10 w-2/3 rounded-lg"/>
        <skeleton_1.Skeleton className="h-32 w-full rounded-lg"/>
      </div>);
    }
    if (isError) {
        const parsedError = (0, error_parser_1.parseApiError)(error);
        const rawError = error;
        const errorCode = rawError?.response?.data?.error;
        const requiredLessonId = rawError?.response?.data?.payload?.requiredLessonId;
        if (parsedError.statusCode === 403 && errorCode === 'PROGRESSION_LOCKED' && requiredLessonId) {
            return <ProgressionLockedState courseId={courseId} requiredLessonId={requiredLessonId}/>;
        }
        return <ErrorState />;
    }
    if (!lessonContent || !lessonMeta)
        return <ErrorState />;
    const handleMarkCompleted = () => {
        if (!lessonMeta.isCompleted) {
            markCompleted(lessonId, {
                onSuccess: () => {
                    sonner_1.toast.success('Đã ghi nhận tiến độ học tập!');
                }
            });
        }
    };
    const handleGoToNextLesson = () => {
        if (nextLessonId) {
            router.push(routes_1.ROUTES.STUDENT.STUDY_ROOM(courseId) + `?lessonId=${nextLessonId}`);
            setQuizState('PREVIEW');
            setCompletedSubmissionId(null);
        }
        else {
            sonner_1.toast.success('Chúc mừng! Bạn đã hoàn thành bài học cuối cùng của khóa.');
        }
    };
    const isQuiz = !!lessonContent.examId;
    const hasVideo = !!lessonContent.primaryVideo;
    const rules = lessonContent.examRules;
    return (<div className="flex flex-col h-full bg-background pb-12 relative">

      {(hasVideo || isQuiz) && (<div className="w-full bg-slate-950/5 dark:bg-black p-0 md:p-6 lg:p-8 flex-shrink-0 flex flex-col gap-8 items-center justify-center border-b border-border/50" onContextMenu={(e) => e.preventDefault()}>
          {hasVideo && lessonContent.primaryVideo && (lessonContent.primaryVideo.url ? (<div className="w-full max-w-5xl mx-auto">
                <video_player_1.VideoPlayer src={lessonContent.primaryVideo.url} isRefetching={isFetching} onTokenExpired={() => refreshToken(courseId, lessonId)} poster={lessonContent.primaryVideo.blurHash} accumulatedTimeRef={accumulatedTimeRef} onTrackTimeUpdate={trackTimeUpdate} onFlush={flushHeartbeat} onOptimisticComplete={handleOptimisticComplete} initialPosition={initialPosition} isCompletedAtLoad={isCompletedAtLoad}/>
              </div>) : (<LockedMediaState type="video"/>))}

          {isQuiz && (<div className="w-full max-w-5xl mx-auto shadow-sm">

              
              {quizState === 'PREVIEW' && (<div className="bg-card border-2 border-border border-dashed rounded-[2rem] p-8 md:p-12 text-center transition-all animate-in fade-in duration-500 relative overflow-hidden">

                  {isHistoryLoading ? (<div className="flex flex-col items-center justify-center py-10">
                      <lucide_react_1.Loader2 className="w-10 h-10 animate-spin text-primary mb-4"/>
                      <p className="text-muted-foreground font-medium">Đang đồng bộ dữ liệu điểm số...</p>
                    </div>) : (<>
                      <lucide_react_1.BrainCircuit className="w-16 h-16 text-primary mx-auto mb-4"/>
                      <h3 className="text-3xl font-black mb-3 text-foreground tracking-tight">Bài Kiểm Tra Trắc Nghiệm</h3>

                      <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-muted-foreground mb-6 bg-secondary/40 p-4 rounded-2xl inline-flex shadow-inner">
                        <span className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-lg shadow-sm border border-border/50">
                         Thời gian: <strong className="text-foreground">{rules?.timeLimit === 0 ? 'Không giới hạn' : `${rules?.timeLimit} phút`}</strong>
                        </span>
                        <span className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-lg shadow-sm border border-border/50">
                          Điểm qua: <strong className="text-foreground">{rules?.passPercentage}%</strong>
                        </span>
                        <span className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-lg shadow-sm border border-border/50">
                          Lượt làm: <strong className="text-foreground">{examHistory?.attemptsUsed || 0} / {rules?.maxAttempts || '∞'}</strong>
                        </span>
                      </div>

                      {examHistory && (<div className="mb-10 flex flex-col items-center gap-3">
                          {examHistory.bestScore !== null && examHistory.bestScore !== undefined && (<div className="flex items-center gap-2 text-lg font-bold text-foreground">
                              <lucide_react_1.Trophy className="w-6 h-6 text-yellow-500"/>
                              Điểm cao nhất: <span className="text-primary text-3xl font-black ml-1">{examHistory.bestScore.toFixed(1)}</span> <span className="text-muted-foreground">/ 10</span>
                            </div>)}

                          {examHistory.isLatestInProgress && (<div className="text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl text-sm font-bold border border-amber-200 dark:border-amber-800/50 flex items-center gap-2">
                              <lucide_react_1.AlertCircle className="w-5 h-5 shrink-0"/> Bạn đang có một phiên thi bị gián đoạn chưa nộp bài!
                            </div>)}

                          {rules?.maxAttempts > 0 && (examHistory.attemptsUsed || 0) >= rules.maxAttempts && !examHistory.isLatestInProgress && (<div className="text-destructive bg-destructive/10 px-4 py-2 rounded-xl text-sm font-bold border border-destructive/20 flex items-center gap-2">
                              <lucide_react_1.Lock className="w-5 h-5 shrink-0"/> Bạn đã sử dụng hết số lượt làm bài cho phép.
                            </div>)}
                        </div>)}

                      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        {(!rules?.maxAttempts || (examHistory?.attemptsUsed || 0) < rules.maxAttempts || examHistory?.isLatestInProgress) && (<button_1.Button size="lg" onClick={() => setQuizState('TAKING')} className={(0, utils_1.cn)("font-bold h-14 px-10 text-lg shadow-lg transition-transform hover:scale-105 w-full sm:w-auto", examHistory?.isLatestInProgress
                                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25"
                                : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25")}>
                            <lucide_react_1.PlayCircle className="w-5 h-5 mr-2"/>
                            {examHistory?.isLatestInProgress ? 'Tiếp tục làm bài' : examHistory ? 'Làm lại bài thi' : 'Bắt đầu làm bài'}
                          </button_1.Button>)}

                        {examHistory && (<link_1.default href={routes_1.ROUTES.STUDENT.HISTORY} className="w-full sm:w-auto">
                            <button_1.Button size="lg" variant="outline" className="font-bold h-14 px-8 text-lg border-border/60 hover:bg-secondary w-full">
                              <lucide_react_1.History className="w-5 h-5 mr-2 text-primary"/>
                              Xem lịch sử & Chữa bài
                            </button_1.Button>
                          </link_1.default>)}
                      </div>
                    </>)}
                </div>)}

              {quizState === 'TAKING' && (<div className="fixed inset-0 z-[100] bg-background overflow-y-auto animate-in slide-in-from-bottom-4 duration-500">
                  <StudentExamEngine_1.StudentExamEngine courseId={courseId} lessonId={lessonId} onComplete={(subId) => {
                        setCompletedSubmissionId(subId);
                        setQuizState('RESULT');
                    }}/>
                </div>)}

              {quizState === 'RESULT' && completedSubmissionId && (<div className="animate-in zoom-in-95 duration-500">
                  <QuizResultView courseId={courseId} submissionId={completedSubmissionId} onNextLesson={handleGoToNextLesson} hasNext={!!nextLessonId}/>
                </div>)}
            </div>)}
        </div>)}

      <div className="p-6 md:px-8 flex-1 max-w-5xl mx-auto w-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">{lessonMeta.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
              <div className="flex items-center gap-2 bg-muted/60 text-muted-foreground px-3 py-1.5 rounded-md border border-border/50">
                {isQuiz ? <lucide_react_1.BrainCircuit className="w-4 h-4 text-purple-500"/> :
            hasVideo ? <lucide_react_1.Play className="w-4 h-4 text-blue-500"/> :
                <lucide_react_1.FileText className="w-4 h-4 text-orange-500"/>}
                <span>
                  {isQuiz ? 'Bài trắc nghiệm' : hasVideo ? 'Video bài giảng' : 'Lý thuyết / Ghi chú'}
                </span>
              </div>
              {lessonMeta.isFreePreview && (<span className="bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider">
                  Học thử
                </span>)}
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            {isQuiz ? (<div className="bg-muted/30 p-3.5 rounded-xl border border-border/50 text-sm flex items-center justify-center md:justify-start gap-2 shadow-sm">
                {lessonMeta.isCompleted ? (<><lucide_react_1.CheckCircle2 className="w-5 h-5 text-green-500"/> <span className="font-bold text-green-700 dark:text-green-400">Đã qua bài thi</span></>) : (<span className="text-muted-foreground font-medium">Bạn cần hoàn thành bài thi để qua bài.</span>)}
              </div>) : hasVideo ? (<div className="bg-muted/30 p-3.5 rounded-xl border border-border/50 text-sm flex items-center justify-center gap-2 shadow-sm">
                {lessonMeta.isCompleted ? (<><lucide_react_1.CheckCircle2 className="w-5 h-5 text-green-500"/> <span className="font-bold text-green-700 dark:text-green-400">Đã học xong</span></>) : (<span className="text-muted-foreground font-medium">Hệ thống sẽ tự động ghi nhận tiến độ khi xem.</span>)}
              </div>) : (<button_1.Button onClick={handleMarkCompleted} disabled={lessonMeta.isCompleted || isMarking} variant={lessonMeta.isCompleted ? 'secondary' : 'default'} className={`w-full md:w-auto font-bold h-12 px-6 transition-all ${lessonMeta.isCompleted ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-700 border border-green-200/50' : ''}`}>
                {isMarking && <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                {lessonMeta.isCompleted ? (<><lucide_react_1.CheckCircle2 className="w-5 h-5 mr-2"/> Đã hoàn thành</>) : ('Đánh dấu hoàn thành')}
              </button_1.Button>)}
          </div>
        </div>
        {lessonContent.content && lessonContent.content !== '<p></p>' && (<div className="pt-6 border-t border-border/40">
            <h3 className="text-lg font-bold mb-4 text-foreground">Nội dung bài học</h3>
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none bg-card p-6 rounded-2xl border border-border/40 shadow-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: lessonContent.content }}/>
          </div>)}

        {lessonContent.attachments && lessonContent.attachments.length > 0 && (<div className="pt-6 border-t border-border/40">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <lucide_react_1.Download className="w-5 h-5 text-orange-500"/> Tài liệu đính kèm (PDF/DOCX)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {lessonContent.attachments.map((file) => (file.url ? (<button key={file.id} onClick={() => setActiveAttachmentId(file.id)} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all group text-left outline-none focus-visible:ring-2 ring-primary ${activeAttachmentId === file.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-muted/20 hover:bg-muted/50'}`}>
                    <FileIcon />
                    <div className="flex-1 min-w-0">
                      <span className={`font-medium text-sm truncate block transition-colors ${activeAttachmentId === file.id ? 'text-primary' : 'text-foreground group-hover:text-orange-600'}`} title={file.originalName}>
                        {file.originalName}
                      </span>
                      {file.size && <span className="text-[10px] text-muted-foreground block mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</span>}
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded border transition-colors ${activeAttachmentId === file.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground group-hover:text-orange-500 border-border/50'}`}>
                      <lucide_react_1.Eye className="w-3.5 h-3.5"/> Xem
                    </div>
                  </button>) : (<div key={file.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-border/50 bg-muted/10 opacity-70 cursor-not-allowed">
                    <lucide_react_1.Lock className="w-5 h-5 text-muted-foreground/60 flex-shrink-0"/>
                    <span className="font-medium text-sm truncate flex-1 text-muted-foreground" title={file.originalName}>{file.originalName}</span>
                  </div>)))}
            </div>

            {activeAttachment && activeAttachment.url && (<div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 ring-1 ring-primary/20">
                <div className="flex items-center justify-between p-3 px-4 bg-muted/40 border-b border-border">
                  <span className="font-semibold text-sm text-foreground flex items-center gap-2 truncate pr-4">
                    <lucide_react_1.Eye className="w-4 h-4 text-primary shrink-0"/> Đang xem: <span className="truncate">{activeAttachment.originalName}</span>
                  </span>
                  <button_1.Button variant="ghost" size="sm" onClick={() => setActiveAttachmentId(null)} className="shrink-0 h-8 gap-1.5 text-muted-foreground hover:text-foreground">
                    <lucide_react_1.X className="w-4 h-4"/> Thu gọn
                  </button_1.Button>
                </div>

                <div className="h-[75vh] w-full bg-slate-900/5 dark:bg-black/20">
                  <DocumentViewer url={activeAttachment.url} originalName={activeAttachment.originalName} isRefetching={isFetching} onTokenExpired={() => refreshToken(courseId, lessonId)} className="border-none rounded-none shadow-none h-full"/>
                </div>
              </div>)}

          </div>)}
      </div>
    </div>);
}
function QuizResultView({ courseId, submissionId, onNextLesson, hasNext }) {
    const { data: result, isLoading, isError } = (0, useTakeExam_1.useExamReview)(submissionId);
    const queryClient = (0, react_query_1.useQueryClient)();
    (0, react_1.useEffect)(() => {
        if (result?.status === 'COMPLETED') {
            console.debug('[QuizResult] Grading done. Invalidating studyTree cache to fetch latest progress & tick...');
            queryClient.invalidateQueries({ queryKey: course_keys_1.courseQueryKeys.studyTree(courseId) });
        }
    }, [result?.status, courseId, queryClient]);
    if (isLoading || !result) {
        return (<div className="p-12 text-center bg-card border rounded-xl">
        <lucide_react_1.Loader2 className="w-10 h-10 animate-spin mx-auto text-primary mb-4"/>
        <p className="font-semibold text-muted-foreground">Đang tải dữ liệu bài thi...</p>
      </div>);
    }
    if (isError) {
        return <div className="p-8 text-center text-destructive font-bold bg-destructive/10 rounded-xl">Lỗi kết nối khi lấy điểm. Vui lòng F5 lại trang!</div>;
    }
    if (result.status === 'GRADING_IN_PROGRESS') {
        return (<div className="bg-card border rounded-xl p-12 text-center space-y-4 animate-in fade-in duration-500">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
          <lucide_react_1.BrainCircuit className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
        </div>
        <h3 className="font-bold text-xl text-foreground">Đang tự động chấm điểm</h3>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {result.message || 'Vui lòng không thoát trang. Kết quả sẽ có trong giây lát...'}
        </p>
      </div>);
    }
    const score = result.summary?.score || 0;
    const isPassed = (score / 10) * 100 >= 50;
    return (<div className="bg-card border rounded-xl p-8 text-center space-y-6 animate-in zoom-in-95 duration-500">
      <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center shadow-inner ${isPassed ? 'bg-green-100 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
        {isPassed ? <lucide_react_1.CheckCircle2 className="w-12 h-12"/> : <lucide_react_1.X className="w-12 h-12"/>}
      </div>

      <div>
        <h2 className="text-4xl font-black mb-2 text-foreground">
          <span className={isPassed ? 'text-green-600' : 'text-destructive'}>{score.toFixed(1)}</span>
          <span className="text-2xl text-muted-foreground"> / 10</span>
        </h2>
        <p className="text-muted-foreground mt-2 font-medium">
          Bạn đã trả lời đúng {result.summary?.correctCount}/{result.summary?.totalQuestions} câu hỏi.
        </p>
      </div>

      <div className="flex justify-center gap-4 pt-6 border-t border-border/50">
        <button_1.Button variant="outline" size="lg" onClick={() => window.location.reload()}>
          Làm lại bài thi
        </button_1.Button>
        <button_1.Button size="lg" onClick={onNextLesson} className="bg-primary text-primary-foreground font-bold px-8 shadow-md hover:bg-primary/90 transition-transform active:scale-95">
          {hasNext ? 'Học bài tiếp theo' : 'Hoàn thành khóa học'}
        </button_1.Button>
      </div>
    </div>);
}
function LockedMediaState({ type }) {
    return (<div className="flex flex-col items-center justify-center aspect-video w-full max-w-5xl mx-auto bg-card border-2 border-border border-dashed rounded-xl p-6 text-center shadow-sm">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
        <lucide_react_1.Lock className="w-10 h-10 text-muted-foreground/60"/>
      </div>
      <h3 className="text-2xl font-bold mb-3 text-foreground">Nội dung đã bị khóa</h3>
      <p className="text-muted-foreground mb-8 max-w-md">
        {type === 'video' ? 'Video bài giảng này' : 'Nội dung này'} thuộc chương trình học cao cấp. Vui lòng ghi danh khóa học để mở khóa toàn bộ tài nguyên.
      </p>
      <button_1.Button size="lg" variant="default" className="font-bold" onClick={() => window.history.back()}>
        Quay lại trang thông tin
      </button_1.Button>
    </div>);
}
function ErrorState() {
    return (<div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <lucide_react_1.AlertCircle className="w-8 h-8 text-destructive"/>
      </div>
      <p className="text-destructive font-semibold text-lg">Không thể tải nội dung bài học.</p>
      <p className="text-muted-foreground">Vui lòng tải lại trang hoặc liên hệ hỗ trợ kỹ thuật.</p>
    </div>);
}
function FileIcon() {
    return (<div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
      <lucide_react_1.FileText className="w-5 h-5 text-orange-600 dark:text-orange-400"/>
    </div>);
}
function ProgressionLockedState({ courseId, requiredLessonId }) {
    const router = (0, navigation_1.useRouter)();
    return (<div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center p-6 bg-card border border-border rounded-xl shadow-sm m-8 max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center ring-8 ring-orange-50">
        <lucide_react_1.Lock className="w-10 h-10 text-orange-500"/>
      </div>
      <div>
        <h3 className="text-2xl font-black text-foreground mb-2 tracking-tight">Bài học đã bị khóa</h3>
        <p className="text-muted-foreground font-medium max-w-md mx-auto">
          Chế độ học tập tuần tự đang được bật. Bạn phải hoàn thành bài học liền trước đó mới có thể mở khóa nội dung này.
        </p>
      </div>
      <button_1.Button size="lg" className="font-bold shadow-md hover:scale-105 transition-transform" onClick={() => router.push(`${routes_1.ROUTES.STUDENT.STUDY_ROOM(courseId)}?lessonId=${requiredLessonId}`)}>
        Quay lại bài học trước
      </button_1.Button>
    </div>);
}
//# sourceMappingURL=LessonViewer.js.map