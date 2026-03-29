'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStudyTree } from '../hooks/useStudyRoom';
import { StudySidebar } from '../components/StudySidebar';
import { LessonViewer } from '../components/LessonViewer';
import { AlertCircle, Loader2, Lock, Star, MessageSquareReply } from 'lucide-react';
import { Progress } from '@/shared/components/ui/progress';
import { parseApiError } from '@/shared/lib/error-parser';
import { Button } from '@/shared/components/ui/button';

import { CreateReviewModal } from '../components/CreateReviewModal';
import { StarRating } from '../components/StarRating';

export function StudyRoomScreen({ courseId }: { courseId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentLessonId = searchParams.get('lessonId');

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const { data: studyTree, isLoading, isError, error } = useStudyTree(courseId);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !studyTree) {
    const apiError = error ? parseApiError(error) : null;

    if (apiError?.statusCode === 403) {
      return (
        <div className="flex h-screen items-center justify-center bg-background p-4">
          <div className="flex flex-col items-center justify-center aspect-video w-full max-w-2xl bg-card border-2 border-border border-dashed rounded-xl p-8 text-center shadow-sm">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Lock className="w-10 h-10 text-muted-foreground/60" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">Truy cập bị từ chối</h3>
            <p className="text-muted-foreground mb-8 max-w-md">
              Bạn chưa ghi danh khóa học này hoặc phiên truy cập đã hết hạn. Vui lòng mua khóa học để mở khóa toàn bộ tài nguyên.
            </p>
            <Button size="lg" variant="default" className="font-bold" onClick={() => router.back()}>
              Quay lại trang thông tin
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-screen items-center justify-center bg-background flex-col gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-bold">Lỗi tải dữ liệu phòng học</h2>
        <p className="text-muted-foreground">Vui lòng tải lại trang hoặc liên hệ hỗ trợ.</p>
      </div>
    );
  }

  const activeLessonId = currentLessonId || studyTree.curriculum.sections[0]?.lessons[0]?.id;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden">
      <main className="flex-1 h-full overflow-y-auto relative bg-muted/20">
        {activeLessonId ? (
          <LessonViewer courseId={courseId} lessonId={activeLessonId} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground font-medium">
            Khóa học này chưa có nội dung.
          </div>
        )}
      </main>

      <aside className="w-full md:w-[350px] lg:w-[400px] h-[50vh] md:h-full border-l border-border bg-card flex flex-col shrink-0">
        
        <div className="p-4 border-b border-border shadow-sm z-10 bg-card space-y-4">
          
          <div>
            <h2 className="font-bold text-lg mb-2 truncate" title="Tiến độ học tập">Tiến độ của bạn</h2>
            <div className="flex items-center gap-3">
              <Progress value={studyTree.progress} className="h-2.5 flex-1" />
              <span className="text-sm font-semibold text-primary">{Math.round(studyTree.progress)}%</span>
            </div>
          </div>

          <div className="pt-3 border-t border-border/50">
            {studyTree.myReview ? (
              <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-1">
                   <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Đánh giá của bạn</span>
                   <StarRating value={studyTree.myReview.rating} readonly size={12} />
                </div>
                {studyTree.myReview.comment && (
                   <p className="text-sm text-foreground mt-1.5 leading-snug line-clamp-3">
                     "{studyTree.myReview.comment}"
                   </p>
                )}
                {studyTree.myReview.teacherReply && (
                  <div className="mt-2 p-2 bg-primary/5 rounded border-l-2 border-primary/50 text-xs">
                    <span className="font-bold text-primary flex items-center gap-1 mb-1"><MessageSquareReply size={12}/> GV phản hồi:</span>
                    <span className="text-muted-foreground">{studyTree.myReview.teacherReply}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Button 
                  variant="outline" 
                  className="w-full h-9 text-sm bg-background border-dashed hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  disabled={studyTree.progress === 0}
                  onClick={() => setIsReviewModalOpen(true)}
                >
                  <Star className="w-4 h-4 mr-2 text-yellow-500" /> 
                  Viết đánh giá khóa học
                </Button>
                {studyTree.progress === 0 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center font-medium">
                    * Vui lòng học ít nhất 1 bài để mở khóa tính năng đánh giá.
                  </p>
                )}
              </div>
            )}
          </div>

        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <StudySidebar 
            sections={studyTree.curriculum.sections} 
            currentLessonId={activeLessonId}
            treeStatus={studyTree.status} 
          />
        </div>
      </aside>

      <CreateReviewModal 
        courseId={courseId}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </div>
  );
}