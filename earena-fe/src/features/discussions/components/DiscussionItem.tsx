'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MessageCircle, Paperclip, ShieldCheck, BookOpen, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { RootQuestion, DiscussionReply } from '../types/discussion.schema';
import { ROUTES } from '@/config/routes';
import { cn } from '@/shared/lib/utils';

interface DiscussionItemProps {
    item: RootQuestion | DiscussionReply;
    isRoot?: boolean;
    onReplyClick?: () => void;
    courseId?: string;
}

export function DiscussionItem({ item, isRoot = false, onReplyClick, courseId }: DiscussionItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const isTeacher = item.user.role === 'TEACHER';
    const contentLimit = 300;
    const isContentLong = item.content.length > contentLimit;

    const displayContent = (isExpanded || !isContentLong)
        ? item.content
        : `${item.content.substring(0, contentLimit)}...`;

    return (
        <div className={cn("flex gap-4 md:gap-5", isRoot ? "pt-6" : "pt-5")}>
            <div className="shrink-0">
                {item.user.avatar ? (
                    <img
                        src={item.user.avatar}
                        alt={item.user.fullName}
                        className={cn(
                            "w-11 h-11 object-cover rounded-full border-2",
                            isTeacher ? "border-amber-400" : "border-border/50"
                        )}
                        loading="lazy"
                    />
                ) : (
                    <div className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center font-bold text-base border-2",
                        isTeacher ? "bg-amber-100 text-amber-700 border-amber-400" : "bg-muted text-muted-foreground border-border/50"
                    )}>
                        {item.user.fullName.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-bold text-base text-foreground">{item.user.fullName}</span>
                    {isTeacher && (
                        <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                            <ShieldCheck className="w-3.5 h-3.5" /> Giáo viên
                        </span>
                    )}
                    <span className="text-xs text-muted-foreground font-medium">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi })}
                    </span>
                </div>

                {/* UI BREADCRUMB REDESIGN: Significantly Prominent Lesson Context */}
                {'lesson' in item && item.lesson && (
                    <div className="flex items-center mt-1.5 mb-4">
                        {courseId ? (
                            <Link
                                href={`${ROUTES.TEACHER.COURSE_CURRICULUM(courseId)}?lessonId=${item.lesson.id}`}
                                className="group flex items-center gap-2.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 px-4 py-3 rounded-xl transition-all max-w-full"
                                title={`Đi tới bài học: ${item.lesson.title}`}
                            >
                                <BookOpen className="w-5 h-5 text-primary shrink-0" />
                                <div className="flex items-center gap-1.5 text-sm font-semibold text-primary truncate">
                                    {item.lesson.section && (
                                        <>
                                            <span className="opacity-70 truncate max-w-[180px]">{item.lesson.section.title}</span>
                                            <ChevronRight className="w-4 h-4 opacity-50" />
                                        </>
                                    )}
                                    <span className="truncate">{item.lesson.title}</span>
                                    <ExternalLink className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </Link>
                        ) : (
                            // REDESIGN FALLBACK: Tăng padding, cỡ chữ, icon, bo góc tương ứng
                            <div className="flex items-center gap-2.5 bg-muted/50 px-4 py-3 rounded-xl border border-border/50">
                                <BookOpen className="w-5 h-5 text-muted-foreground shrink-0" />
                                <span className="text-sm font-semibold text-muted-foreground truncate">
                                    {item.lesson.title}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className={cn(
                    "text-base leading-relaxed whitespace-pre-wrap break-words",
                    isTeacher ? "text-foreground font-semibold" : "text-muted-foreground"
                )}>
                    {displayContent}
                    {isContentLong && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-primary font-bold ml-1.5 hover:underline outline-none text-base"
                        >
                            {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                        </button>
                    )}
                </div>

                {item.attachments && item.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                        {item.attachments.map(file => (
                            <a
                                key={file.id}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative block rounded-xl overflow-hidden border border-border"
                            >
                                {file.url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                    <img src={file.url} alt="đính kèm" className="h-24 w-36 object-cover hover:scale-105 transition-transform" loading="lazy" />
                                ) : (
                                    <div className="flex items-center gap-2.5 h-12 px-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <Paperclip className="w-5 h-5 text-primary" />
                                        <span className="text-sm font-medium text-foreground">Tài liệu đính kèm</span>
                                    </div>
                                )}
                            </a>
                        ))}
                    </div>
                )}

                {isRoot && (
                    <div className="flex items-center gap-5 pt-2">
                        {onReplyClick && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7.5 px-3.5 text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/5"
                                onClick={onReplyClick}
                            >
                                Phản hồi
                            </Button>
                        )}
                        {('replyCount' in item) && item.replyCount > 0 && (
                            <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                                <MessageCircle className="w-4 h-4" />
                                {item.replyCount} câu trả lời
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}