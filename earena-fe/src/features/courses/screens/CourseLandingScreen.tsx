'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePublicCourseDetail } from '../hooks/useCourses';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useCheckoutFlow } from '@/features/billing/hooks/useBillingFlows';
import { formatCurrency } from '@/shared/lib/utils';
import { ROUTES } from '@/config/routes';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import Link from 'next/link';
import {
  CheckCircle2, PlayCircle, FileText, HelpCircle, Lock,
  ShoppingCart, Loader2, Star, Calendar, ChevronRight, MonitorPlay, Paperclip, MessageCircle,
} from 'lucide-react';
import { SectionPreview, LessonPreview } from '../types/course.schema';
import { FreePreviewModal } from '../components/FreePreviewModal';
import { CourseReviewsSection } from '../components/CourseReviewsSection';
import { ShareCourseToCommunityButton } from '@/features/community/components/ShareCourseToCommunityButton';
import { CourseCommunitySection } from '@/features/community/components/CourseCommunitySection';
import { toast } from 'sonner';

// --- UTILITY HELPERS ---
function formatBytes(bytes?: number) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds?: number) {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// [CTO FIX]: Tăng cường bảo vệ type runtime
function estimateReadingTime(html?: string) {
  if (!html || typeof html !== 'string' || html === '<p></p>') return 0;
  const text = html.replace(/<[^>]*>?/gm, ''); // Strip HTML tags
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / 200); // Average 200 words per minute
}

export function CourseLandingScreen({ slug }: { slug: string }) {
  const router = useRouter();
  const { data: course, isLoading, isError } = usePublicCourseDetail(slug);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const { handleCheckout, isProcessing } = useCheckoutFlow();

  const [previewLesson, setPreviewLesson] = useState<LessonPreview | null>(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  if (isLoading) return <CourseLandingSkeleton />;
  if (isError || !course) return <div className="text-center py-32 text-red-500 font-medium">Không tìm thấy khóa học hoặc khóa học đã bị gỡ.</div>;

  const finalPrice = (course.discountPrice && course.discountPrice > 0) ? course.discountPrice : course.price;
  const isFree = finalPrice === 0;

  const teacherInfo = course.teacher || { fullName: 'Giáo viên ẩn danh', avatar: '', bio: null };
  const safeImageUrl = course.coverImage?.url || 'https://placehold.co/600x400/EEE/31343C?text=No+Cover';
  const blurProps = course.coverImage?.blurHash?.startsWith('data:image')
    ? { placeholder: "blur" as const, blurDataURL: course.coverImage.blurHash } : {};

  const lastUpdateDate = course.updatedAt || course.createdAt;

  const onEnrollClick = () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để tiếp tục ghi danh.');
      router.push(`${ROUTES.AUTH.LOGIN}?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    handleCheckout(course);
  };

  const onPreviewClick = (lesson: LessonPreview) => {
    // [XÁC NHẬN]: Giữ nguyên logic bắt đăng nhập để tạo lead theo yêu cầu
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để trải nghiệm tính năng học thử!');
      router.push(`${ROUTES.AUTH.LOGIN}?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setPreviewLesson(lesson);
  };

  return (
    <div className="w-full bg-background animate-in fade-in duration-500 pb-20">

      {/* --- HERO SECTION --- */}
      <div className="bg-slate-950 text-white py-12 md:py-20 px-4">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
          <div className="lg:col-span-2 space-y-6">

            <div className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-2">
              <span className="cursor-pointer hover:text-blue-300 transition-colors">Trang chủ</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
              <span className="cursor-pointer hover:text-blue-300 transition-colors">{course.subject?.name || 'Chưa phân loại'}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-white">{course.title}</h1>
            <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">{course.description}</p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-300 pt-2">
              <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
                <Star className="w-4 h-4 fill-yellow-400" />
                <span>{course.averageRating || 'Chưa có điểm'}</span>
                <span className="text-slate-400 font-normal">({course.totalReviews || 0} đánh giá)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <MonitorPlay className="w-4 h-4 text-slate-400" />
                <span>{course.curriculum?.totalLessons || 0} bài học</span>
              </div>

              {lastUpdateDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Cập nhật: {new Date(lastUpdateDate).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-800/50">
              <div className="text-slate-400 text-sm">Được tạo bởi:</div>
              <div className="font-bold text-white">{teacherInfo.fullName}</div>
            </div>
          </div>

          {/* COVER IMAGE & TRAILER BUTTON */}
          <div className="lg:col-span-1">
            <div
              className={`relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 group ${course.promotionalVideoId ? 'cursor-pointer' : ''}`}
              onClick={() => course.promotionalVideoId && setIsTrailerOpen(true)}
            >
              <Image
                src={safeImageUrl} alt="Cover" fill className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 33vw" priority {...blurProps}
              />

              {/* Overlay Play Button nếu có Trailer */}
              {course.promotionalVideoId && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center group-hover:bg-black/50 transition-all">
                  <div className="w-16 h-16 bg-primary/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-8 h-8 text-white ml-1" />
                  </div>
                  <span className="text-white font-bold mt-3 tracking-widest text-sm drop-shadow-md">XEM TRAILER</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- BODY SECTION --- */}
      <div className="max-w-[1200px] mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12 relative items-start">

        <div className="lg:col-span-2 space-y-10">

          {/* [CTO FIX]: Tăng cường bảo vệ mảng */}
          {Array.isArray(course.benefits) && course.benefits.length > 0 && (
            <div className="bg-card p-6 md:p-8 border border-border rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Bạn sẽ học được gì?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.benefits.map((benefit: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-foreground/80 leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* [CTO FIX]: Tăng cường bảo vệ mảng */}
          {Array.isArray(course.requirements) && course.requirements.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Yêu cầu khóa học</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                {course.requirements.map((req: string, idx: number) => (
                  <li key={idx} className="pl-2">{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* --- CURRICULUM ĐA TẦNG (MAX PING) --- */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <h2 className="text-2xl font-bold">Nội dung khóa học</h2>
              <div className="text-sm font-medium text-muted-foreground flex gap-3">
                <span>{course.curriculum?.sections?.length || 0} chương</span> •
                <span>{course.curriculum?.totalLessons || 0} bài học</span>
              </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
              {/* [CTO FIX]: An toàn hóa Array.isArray */}
              {!Array.isArray(course.curriculum?.sections) || course.curriculum!.sections.length === 0 ? (
                <p className="p-8 text-center text-muted-foreground italic">Nội dung đang được cập nhật...</p>
              ) : (
                course.curriculum!.sections.map((section: SectionPreview, sIdx: number) => (
                  <div key={section.id} className="border-b border-border last:border-0">
                    <div className="bg-muted/30 p-4 font-bold text-foreground">
                      Chương {sIdx + 1}: {section.title}
                    </div>
                    <div className="divide-y divide-border/50">
                      {/* [CTO FIX]: An toàn hóa Array.isArray */}
                      {Array.isArray(section.lessons) && section.lessons.map((lesson: LessonPreview) => (
                        <CompositeLessonRow
                          key={lesson.id}
                          lesson={lesson}
                          isEnrolled={!!course.isEnrolled}
                          onPreviewClick={() => onPreviewClick(lesson)}
                          onStudyClick={() => router.push(`${ROUTES.STUDENT.STUDY_ROOM(course.id)}?lessonId=${lesson.id}`)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Teacher Bio */}
          <div className="pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">Giảng viên của bạn</h2>
            <div className="flex flex-col sm:flex-row gap-6 items-start bg-card border border-border/50 p-6 rounded-2xl shadow-sm">
              <Image
                src={teacherInfo.avatar || 'https://ui-avatars.com/api/?name=Teacher&background=random'}
                alt={teacherInfo.fullName}
                width={100} height={100}
                className="rounded-full w-24 h-24 object-cover ring-4 ring-muted"
              />
              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="text-xl font-bold">{teacherInfo.fullName}</h3>
                  <p className="text-sm text-primary font-medium mt-1">Giảng viên EArena</p>
                </div>
                {teacherInfo.bio ? (
                  <p className="text-muted-foreground leading-relaxed text-sm">{teacherInfo.bio}</p>
                ) : (
                  <p className="text-muted-foreground italic text-sm">Giảng viên chưa cập nhật tiểu sử.</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {isAuthenticated &&
                    user?.role === 'STUDENT' &&
                    course.teacher?.id && (
                      <Button variant="default" size="sm" className="font-semibold" asChild>
                        <Link
                          href={`${ROUTES.STUDENT.MESSAGES}?peer=${encodeURIComponent(course.teacher.id)}`}
                        >
                          <MessageCircle className="mr-2 w-4 h-4" />
                          Nhắn giáo viên
                        </Link>
                      </Button>
                    )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-semibold"
                    onClick={() => toast.info('Tính năng đang phát triển.')}
                  >
                    Xem hồ sơ giảng viên
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <CourseCommunitySection courseId={course.id} />

          {/* --- BỔ SUNG SECTION REVIEW VÀO ĐÂY (NẰM DƯỚI TEACHER BIO) --- */}
          {/* Gắn thêm id="reviews" để làm điểm neo (anchor) cho Teacher nhảy tới */}
          <div id="reviews" className="pt-8 border-t border-border scroll-mt-24">
            <CourseReviewsSection
              courseId={course.id}
              teacherId={course.teacher?.id}
            />
          </div>

        </div>

        {/* --- RIGHT COLUMN (Sticky Action Card) --- */}
        <div className="relative lg:block">
          <div className="sticky top-24 bg-card rounded-2xl border border-border shadow-2xl p-6 md:p-8 flex flex-col gap-6 w-full">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Giá đăng ký</span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-primary">{isFree ? 'Miễn phí' : formatCurrency(finalPrice)}</span>
              </div>
              {course.discountPrice !== undefined && course.discountPrice > 0 && course.discountPrice < course.price && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg text-muted-foreground line-through decoration-red-500/50">{formatCurrency(course.price)}</span>
                  <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded">Khuyến mãi</span>
                </div>
              )}
            </div>

            {course.isEnrolled ? (
              <Button
                size="lg"
                className="w-full text-lg h-14 font-bold rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-95"
                onClick={() => router.push(ROUTES.STUDENT.STUDY_ROOM(course.id))}
              >
                <MonitorPlay className="mr-2 w-5 h-5" />
                Vào phòng học ngay
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full text-lg h-14 font-bold rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-95"
                onClick={onEnrollClick}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="mr-2 w-5 h-5 animate-spin" /> : <ShoppingCart className="mr-2 w-5 h-5" />}
                {isProcessing ? 'Đang giao dịch...' : isFree ? 'Ghi danh miễn phí' : 'Mua khóa học ngay'}
              </Button>
            )}

            <ShareCourseToCommunityButton
              courseId={course.id}
              subjectId={course.subject?.id}
            />

            <div className="space-y-4 mt-2">
              <div className="text-sm font-bold text-foreground">Khóa học bao gồm:</div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><MonitorPlay className="w-4 h-4" /> {course.curriculum?.totalVideos || 0} Video bài giảng chất lượng cao</li>
                <li className="flex items-center gap-2"><FileText className="w-4 h-4" /> {course.curriculum?.totalDocuments || 0} Tài liệu chuyên sâu tải xuống</li>
                <li className="flex items-center gap-2"><HelpCircle className="w-4 h-4" /> {course.curriculum?.totalQuizzes || 0} Bài kiểm tra năng lực</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-border/50 text-xs text-center text-muted-foreground leading-relaxed">
              Cam kết hoàn tiền trong 7 ngày.<br />Thanh toán an toàn 100% qua ví EArena.
            </div>
          </div>
        </div>

      </div>

      {/* --- MODALS --- */}
      <FreePreviewModal
        courseId={course.id}
        lesson={previewLesson}
        isOpen={!!previewLesson}
        onClose={() => setPreviewLesson(null)}
      />

      {/* Trailer Modal (Thay thế DumbMediaPlayer) */}
      <Dialog open={isTrailerOpen} onOpenChange={setIsTrailerOpen}>
        <DialogContent className="max-w-4xl bg-black border-border shadow-2xl p-0 overflow-hidden">
          <div className="relative w-full aspect-video bg-black flex items-center justify-center">
            {/* Giả định BE trả ID hoặc chuỗi URL trực tiếp ở field promotionalVideoId */}
            {course.promotionalVideoId ? (
              <video
                src={course.promotionalVideoId}
                controls
                autoPlay
                controlsList="nodownload"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-white">Video đang được xử lý...</span>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- SUB-COMPONENT: ROW HIỂN THỊ ĐA TẦNG CỦA BÀI HỌC ---
function CompositeLessonRow({
  lesson,
  isEnrolled,
  onPreviewClick,
  onStudyClick
}: {
  lesson: LessonPreview;
  isEnrolled: boolean;
  onPreviewClick: () => void;
  onStudyClick: () => void;
}) {
  const readingTime = estimateReadingTime(lesson.content);

  return (
    <div className="p-4 hover:bg-muted/10 transition-colors flex flex-col gap-3 group">

      {/* Header: Tiêu đề bài học & Nút Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground text-sm">{lesson.title}</span>
        </div>

        {isEnrolled ? (
          <button
            onClick={(e) => { e.stopPropagation(); onStudyClick(); }}
            className="text-[10px] font-bold bg-primary/10 text-primary border border-transparent hover:border-primary/30 px-3 py-1 rounded-full uppercase cursor-pointer hover:bg-primary/20 transition-all flex items-center gap-1 shrink-0"
          >
            <MonitorPlay className="w-3 h-3" />
            Vào học
          </button>
        ) : lesson.isFreePreview ? (
          <button
            onClick={(e) => { e.stopPropagation(); onPreviewClick(); }}
            className="text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-transparent hover:border-green-300 px-3 py-1 rounded-full uppercase cursor-pointer hover:bg-green-200 transition-all flex items-center gap-1 shrink-0"
          >
            <PlayCircle className="w-3 h-3" />
            Học thử
          </button>
        ) : (
          <Lock className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors shrink-0" />
        )}
      </div>

      {/* Chi tiết tài nguyên bên trong (Composite Display) */}
      <div className="pl-4 border-l-2 border-border/60 space-y-2.5">

        {lesson.primaryVideo && (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
            <PlayCircle className="w-4 h-4 text-blue-500" />
            <span>Video bài giảng {lesson.primaryVideo.duration ? `• ${formatDuration(lesson.primaryVideo.duration)}` : ''}</span>
          </div>
        )}

        {readingTime > 0 && (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
            <FileText className="w-4 h-4 text-green-500" />
            <span>Lý thuyết & Ghi chú • Ước tính {readingTime} phút đọc</span>
          </div>
        )}

        {lesson.attachments && lesson.attachments.length > 0 && lesson.attachments.map(att => (
          <div key={att.id} className="flex items-center gap-2.5 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
            <Paperclip className="w-4 h-4 text-orange-500" />
            <span className="truncate max-w-[200px] md:max-w-[300px]">{att.originalName}</span>
            <span className="text-[11px] opacity-70 font-mono">({formatBytes(att.size)})</span>
          </div>
        ))}

        {lesson.examId && (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
            <HelpCircle className="w-4 h-4 text-purple-500" />
            <span>Bài kiểm tra đánh giá năng lực</span>
          </div>
        )}

      </div>
    </div>
  );
}

function CourseLandingSkeleton() {
  return (
    <div className="w-full h-screen bg-background animate-pulse">
      <div className="bg-slate-900 w-full h-[40vh] mb-12"></div>
      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    </div>
  );
}