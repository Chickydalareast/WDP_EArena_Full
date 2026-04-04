'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudyRoomScreen = StudyRoomScreen;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const useStudyRoom_1 = require("../hooks/useStudyRoom");
const StudySidebar_1 = require("../components/StudySidebar");
const LessonViewer_1 = require("../components/LessonViewer");
const lucide_react_1 = require("lucide-react");
const progress_1 = require("@/shared/components/ui/progress");
const error_parser_1 = require("@/shared/lib/error-parser");
const button_1 = require("@/shared/components/ui/button");
const CreateReviewModal_1 = require("../components/CreateReviewModal");
const StarRating_1 = require("../components/StarRating");
function StudyRoomScreen({ courseId }) {
    const searchParams = (0, navigation_1.useSearchParams)();
    const router = (0, navigation_1.useRouter)();
    const currentLessonId = searchParams.get('lessonId');
    const [isReviewModalOpen, setIsReviewModalOpen] = (0, react_1.useState)(false);
    const [reviewPromptData, setReviewPromptData] = (0, react_1.useState)({});
    const { data: studyTree, isLoading, isError, error } = (0, useStudyRoom_1.useStudyTree)(courseId);
    (0, react_1.useEffect)(() => {
        const handleReviewPrompt = (e) => {
            const detail = e.detail;
            if (detail.courseId === courseId) {
                const hasDismissed = localStorage.getItem(`has_dismissed_review_${courseId}`);
                if (!hasDismissed) {
                    window.dispatchEvent(new CustomEvent('core:pause_video'));
                    setIsReviewModalOpen(true);
                }
            }
        };
        window.addEventListener('core:prompt_review', handleReviewPrompt);
        return () => window.removeEventListener('core:prompt_review', handleReviewPrompt);
    }, [courseId]);
    if (isLoading) {
        return (<div className="flex h-screen items-center justify-center bg-background">
        <lucide_react_1.Loader2 className="w-10 h-10 animate-spin text-primary"/>
      </div>);
    }
    if (isError || !studyTree) {
        const apiError = error ? (0, error_parser_1.parseApiError)(error) : null;
        if (apiError?.statusCode === 403) {
            return (<div className="flex h-screen items-center justify-center bg-background p-4">
          <div className="flex flex-col items-center justify-center aspect-video w-full max-w-2xl bg-card border-2 border-border border-dashed rounded-xl p-8 text-center shadow-sm">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <lucide_react_1.Lock className="w-10 h-10 text-muted-foreground/60"/>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">Truy cập bị từ chối</h3>
            <p className="text-muted-foreground mb-8 max-w-md">
              Bạn chưa ghi danh khóa học này hoặc phiên truy cập đã hết hạn. Vui lòng mua khóa học để mở khóa toàn bộ tài nguyên.
            </p>
            <button_1.Button size="lg" variant="default" className="font-bold" onClick={() => router.back()}>
              Quay lại trang thông tin
            </button_1.Button>
          </div>
        </div>);
        }
        return (<div className="flex h-screen items-center justify-center bg-background flex-col gap-4">
        <lucide_react_1.AlertCircle className="w-12 h-12 text-destructive"/>
        <h2 className="text-xl font-bold">Lỗi tải dữ liệu phòng học</h2>
        <p className="text-muted-foreground">Vui lòng tải lại trang hoặc liên hệ hỗ trợ.</p>
      </div>);
    }
    const activeLessonId = currentLessonId || studyTree.curriculum.sections[0]?.lessons[0]?.id;
    return (<div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden">
      <main className="flex-1 h-full overflow-y-auto relative bg-muted/20">
        {activeLessonId ? (<LessonViewer_1.LessonViewer courseId={courseId} lessonId={activeLessonId}/>) : (<div className="flex items-center justify-center h-full text-muted-foreground font-medium">
            Khóa học này chưa có nội dung.
          </div>)}
      </main>

      <aside className="w-full md:w-[350px] lg:w-[400px] h-[50vh] md:h-full border-l border-border bg-card flex flex-col shrink-0">

        <div className="p-4 border-b border-border shadow-sm z-10 bg-card space-y-4">

          <div>
            <h2 className="font-bold text-lg mb-2 truncate" title="Tiến độ học tập">Tiến độ của bạn</h2>
            <div className="flex items-center gap-3">
              <progress_1.Progress value={studyTree.progress} className="h-2.5 flex-1"/>
              <span className="text-sm font-semibold text-primary">{Math.round(studyTree.progress)}%</span>
            </div>
          </div>

          <div className="pt-3 border-t border-border/50">
            {studyTree.myReview ? (<div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Đánh giá của bạn</span>
                  <StarRating_1.StarRating value={studyTree.myReview.rating} readonly size={12}/>
                </div>
                {studyTree.myReview.comment && (<p className="text-sm text-foreground mt-1.5 leading-snug line-clamp-3">
                    "{studyTree.myReview.comment}"
                  </p>)}
                {studyTree.myReview.teacherReply && (<div className="mt-2 p-2 bg-primary/5 rounded border-l-2 border-primary/50 text-xs">
                    <span className="font-bold text-primary flex items-center gap-1 mb-1"><lucide_react_1.MessageSquareReply size={12}/> GV phản hồi:</span>
                    <span className="text-muted-foreground">{studyTree.myReview.teacherReply}</span>
                  </div>)}
              </div>) : (<div className="flex flex-col gap-1.5">
                <button_1.Button variant="outline" className="w-full h-9 text-sm bg-background border-dashed hover:border-primary/50 hover:bg-primary/5 transition-colors" disabled={studyTree.progress === 0} onClick={() => setIsReviewModalOpen(true)}>
                  <lucide_react_1.Star className="w-4 h-4 mr-2 text-yellow-500"/>
                  Viết đánh giá khóa học
                </button_1.Button>
                {studyTree.progress === 0 && (<p className="text-[11px] text-amber-600 dark:text-amber-400 text-center font-medium">
                    * Vui lòng học ít nhất 1 bài để mở khóa tính năng đánh giá.
                  </p>)}
              </div>)}
          </div>

        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <StudySidebar_1.StudySidebar sections={studyTree.curriculum.sections} currentLessonId={activeLessonId} treeStatus={studyTree.status} progressionMode={studyTree.progressionMode}/>
        </div>
      </aside>

      <CreateReviewModal_1.CreateReviewModal courseId={courseId} isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title={reviewPromptData.title} message={reviewPromptData.message}/>
    </div>);
}
//# sourceMappingURL=StudyRoomScreen.js.map