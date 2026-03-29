'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { useLessonContent, useRefreshLessonToken } from '../hooks/useStudyRoom';
import { LessonPreview } from '../types/course.schema';
import { ROUTES } from '@/config/routes';
import { VideoPlayer } from '@/shared/components/ui/video-player';
import { AlertCircle, Loader2, FileText, BrainCircuit, Download, X, Lock, Eye } from 'lucide-react';

const DocumentViewer = dynamic(
    () => import('@/shared/components/ui/document-viewer').then((mod) => mod.DocumentViewer),
    {
        ssr: false,
        loading: () => (
            <div className="flex flex-col items-center justify-center h-full w-full gap-4 bg-slate-900/5 dark:bg-black/20 min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-semibold text-muted-foreground">Đang khởi tạo trình xem tài liệu...</p>
            </div>
        )
    }
);

interface FreePreviewModalProps {
    courseId: string;
    lesson: LessonPreview | null;
    isOpen: boolean;
    onClose: () => void;
}

export function FreePreviewModal({ courseId, lesson, isOpen, onClose }: FreePreviewModalProps) {
    const router = useRouter();
    const { refreshToken } = useRefreshLessonToken();

    const [activeAttachmentId, setActiveAttachmentId] = useState<string | null>(null);

    useEffect(() => {
        setActiveAttachmentId(null);
    }, [lesson?.id, isOpen]);

    const { data: lessonContent, isLoading, isError, isFetching } = useLessonContent(
        courseId,
        isOpen && lesson ? lesson.id : null
    );

    const activeAttachment = useMemo(() => {
        if (!activeAttachmentId || !lessonContent?.attachments) return null;
        return lessonContent.attachments.find(a => a.id === activeAttachmentId) || null;
    }, [activeAttachmentId, lessonContent?.attachments]);

    const handleStartQuiz = () => {
        if (lessonContent?.examId) {
            router.push(ROUTES.STUDENT.TAKE_EXAM(lessonContent.examId));
            onClose();
        }
    };

    const hasVideo = !!lessonContent?.primaryVideo?.url;
    const isQuiz = !!lessonContent?.examId;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="w-[95vw] h-[90vh] max-w-none sm:max-w-5xl lg:max-w-6xl xl:max-w-7xl p-0 rounded-2xl border border-border/50 bg-background flex flex-col overflow-hidden shadow-2xl duration-300"
                showCloseButton={false}
            >
                <DialogDescription className="sr-only">
                    Chế độ xem trước nội dung khóa học
                </DialogDescription>

                <DialogHeader className="p-4 border-b border-border bg-card sticky top-0 z-50 flex-row items-center justify-between shrink-0 shadow-sm">
                    <DialogTitle className="text-lg md:text-xl font-bold flex items-center gap-3 truncate pr-4">
                        <span className="bg-green-500 text-white px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider shadow-sm shrink-0">
                            Học thử miễn phí
                        </span>
                        <span className="truncate">{lesson?.title}</span>
                    </DialogTitle>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted shrink-0">
                        <X className="w-5 h-5" />
                    </Button>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto w-full bg-muted/10 relative">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4 min-h-[50vh]">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-muted-foreground font-medium animate-pulse">Đang tải rạp hát học thử...</p>
                        </div>
                    ) : isError || !lessonContent ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-3 text-center p-6 min-h-[50vh]">
                            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                                <AlertCircle className="w-8 h-8 text-destructive" />
                            </div>
                            <p className="text-lg font-bold text-destructive">Không thể tải nội dung học thử.</p>
                            <Button variant="outline" onClick={onClose} className="mt-4">Đóng cửa sổ</Button>
                        </div>
                    ) : (
                        <div className="flex flex-col w-full pb-16">

                            {(hasVideo || isQuiz) && (
                                <div className="w-full bg-black p-0 md:p-6 lg:p-8 flex justify-center shadow-inner relative">
                                    {/* [CTO FIX]: Bỏ toán tử !, dùng Type Guard an toàn với && */}
                                    {hasVideo && lessonContent.primaryVideo?.url ? (
                                        <div className="w-full max-w-5xl mx-auto shadow-2xl rounded-xl overflow-hidden ring-1 ring-white/10">
                                            <VideoPlayer
                                                src={lessonContent.primaryVideo.url}
                                                isRefetching={isFetching}
                                                onTokenExpired={() => {
                                                    if (lesson?.id) refreshToken(courseId, lesson.id);
                                                }}
                                            />
                                        </div>
                                    ) : isQuiz ? (
                                        <div className="flex flex-col items-center justify-center aspect-video w-full max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 text-center shadow-2xl">
                                            <BrainCircuit className="w-16 h-16 text-primary mb-6" />
                                            <h3 className="text-3xl font-bold mb-4 text-white">Bài Kiểm Tra Trắc Nghiệm</h3>
                                            <p className="text-slate-400 mb-8 max-w-md">Chế độ học thử cho phép bạn trải nghiệm trực tiếp hệ thống thi trắc nghiệm của EArena.</p>
                                            <Button size="lg" onClick={handleStartQuiz} className="font-bold text-lg px-8 h-14">
                                                Bắt đầu làm bài thi mẫu
                                            </Button>
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            <div className="px-4 md:px-8 mt-8 max-w-5xl mx-auto w-full space-y-8">

                                {lessonContent.content && lessonContent.content !== '<p></p>' && (
                                    <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-border/50 pb-4">
                                            <FileText className="w-6 h-6 text-primary" /> Ghi chú bài giảng
                                        </h3>
                                        <div
                                            className="prose prose-sm md:prose-base dark:prose-invert max-w-none leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: lessonContent.content }}
                                        />
                                    </div>
                                )}

                                {Array.isArray(lessonContent.attachments) && lessonContent.attachments.length > 0 && (
                                    <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-border/50 pb-4">
                                            <Download className="w-6 h-6 text-orange-500" /> Tài liệu đính kèm
                                        </h3>

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
                                                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                            <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className={`font-semibold text-sm truncate block transition-colors ${activeAttachmentId === file.id ? 'text-primary' : 'text-foreground group-hover:text-orange-600'}`} title={file.originalName}>
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

                                                <div className="h-[75vh] min-h-[600px] w-full bg-slate-900/5 dark:bg-black/20">
                                                    <DocumentViewer
                                                        url={activeAttachment.url}
                                                        originalName={activeAttachment.originalName}
                                                        isRefetching={isFetching}
                                                        onTokenExpired={() => {
                                                            if (lesson?.id) refreshToken(courseId, lesson.id);
                                                        }}
                                                        className="border-none rounded-none shadow-none h-full"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}