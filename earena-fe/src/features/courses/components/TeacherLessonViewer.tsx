'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { LessonPreview } from '../types/course.schema';

import { VideoPlayer } from '@/shared/components/ui/video-player';
import { Button } from '@/shared/components/ui/button';
import { Play, FileText, BrainCircuit, Download, Eye, X, ShieldAlert } from 'lucide-react';

const DocumentViewer = dynamic(
    () => import('@/shared/components/ui/document-viewer').then((mod) => mod.DocumentViewer),
    {
        ssr: false,
        loading: () => (
            <div className="flex flex-col items-center justify-center h-full w-full gap-4 bg-slate-900/5 dark:bg-black/20">
                <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm font-semibold text-muted-foreground">Đang khởi tạo trình xem PDF...</p>
            </div>
        )
    }
);

interface TeacherLessonViewerProps {
    lesson: LessonPreview;
}

export function TeacherLessonViewer({ lesson }: TeacherLessonViewerProps) {
    const [activeAttachmentId, setActiveAttachmentId] = useState<string | null>(null);

    const dummyTimeRef = useRef<number>(0);

    const isQuiz = !!lesson.examId;
    const hasVideo = !!lesson.primaryVideo;

    const activeAttachment = lesson.attachments?.find(a => a.id === activeAttachmentId) || null;

    return (
        <div className="flex flex-col h-full bg-background pb-12 animate-in fade-in duration-500">

            {(hasVideo || isQuiz) && (
                <div
                    className="w-full bg-slate-950/5 dark:bg-black p-0 md:p-6 lg:p-8 flex-shrink-0 flex flex-col gap-8 items-center justify-center border-b border-border/50"
                    onContextMenu={(e) => e.preventDefault()}
                >
                    {hasVideo && lesson.primaryVideo?.url && (
                        <div className="w-full max-w-5xl mx-auto">
                            <VideoPlayer
                                src={lesson.primaryVideo.url}
                                poster={lesson.primaryVideo.blurHash}
                                isCompletedAtLoad={true}
                                accumulatedTimeRef={dummyTimeRef}
                                onFlush={() => { }}
                                onTrackTimeUpdate={() => { }}
                                onOptimisticComplete={() => { }}
                            />
                        </div>
                    )}

                    {isQuiz && (
                        <div className="w-full max-w-5xl mx-auto shadow-sm">
                            <div className="bg-card border-2 border-border border-dashed rounded-xl p-12 text-center transition-all">
                                <BrainCircuit className="w-16 h-16 text-primary mx-auto mb-4" />
                                <h3 className="text-3xl font-black mb-3 text-foreground tracking-tight">Bài Kiểm Tra Trắc Nghiệm</h3>
                                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                                    Đây là giao diện xem trước. Trải nghiệm làm bài thi và tính điểm chỉ khả dụng đối với tài khoản Học viên.
                                </p>
                                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium">
                                    <ShieldAlert className="w-4 h-4" />
                                    Giáo viên không cần làm bài thi để hoàn thành tiến độ.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="p-6 md:px-8 flex-1 max-w-5xl mx-auto w-full space-y-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-3 flex-1">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">{lesson.title}</h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                            <div className="flex items-center gap-2 bg-muted/60 text-muted-foreground px-3 py-1.5 rounded-md border border-border/50">
                                {isQuiz ? <BrainCircuit className="w-4 h-4 text-purple-500" /> :
                                    hasVideo ? <Play className="w-4 h-4 text-blue-500" /> :
                                        <FileText className="w-4 h-4 text-orange-500" />}
                                <span>
                                    {isQuiz ? 'Bài trắc nghiệm' : hasVideo ? 'Video bài giảng' : 'Lý thuyết / Ghi chú'}
                                </span>
                            </div>
                            {lesson.isFreePreview && (
                                <span className="bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider">
                                    Học thử (Free Preview)
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="shrink-0 w-full md:w-auto">
                        <div className="bg-primary/5 p-3.5 rounded-xl border border-primary/20 text-sm flex items-center justify-center gap-2 shadow-sm text-primary font-medium">
                            <Eye className="w-5 h-5" /> <span>Chế độ Xem trước (View Mode)</span>
                        </div>
                    </div>
                </div>

                {lesson.content && lesson.content !== '<p></p>' && (
                    <div className="pt-6 border-t border-border/40">
                        <h3 className="text-lg font-bold mb-4 text-foreground">Nội dung bài học</h3>
                        <div
                            className="prose prose-sm md:prose-base dark:prose-invert max-w-none bg-card p-6 rounded-2xl border border-border/40 shadow-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: lesson.content }}
                        />
                    </div>
                )}

                {lesson.attachments && lesson.attachments.length > 0 && (
                    <div className="pt-6 border-t border-border/40">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Download className="w-5 h-5 text-orange-500" /> Tài liệu đính kèm (PDF/DOCX)
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                            {lesson.attachments.map((file) => (
                                <button
                                    key={file.id}
                                    onClick={() => setActiveAttachmentId(file.id)}
                                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all group text-left outline-none focus-visible:ring-2 ring-primary ${activeAttachmentId === file.id
                                        ? 'border-primary bg-primary/5 shadow-sm'
                                        : 'border-border bg-muted/20 hover:bg-muted/50'
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div>
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

                                <div className="h-[75vh] w-full bg-slate-900/5 dark:bg-black/20">
                                    <DocumentViewer
                                        url={activeAttachment.url}
                                        originalName={activeAttachment.originalName}
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