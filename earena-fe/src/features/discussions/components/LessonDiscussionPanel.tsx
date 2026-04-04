'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageCircleQuestion, Loader2, ArrowDownCircle } from 'lucide-react';
import { useLessonDiscussions } from '../hooks/useLessonDiscussions';
import { SortOption } from '../types/discussion.schema';
import { DiscussionEditor } from './DiscussionEditor';
import { DiscussionThread } from './DiscussionThread';
import { EmptyDiscussion } from './EmptyDiscussion';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

interface LessonDiscussionPanelProps {
    courseId: string;
    lessonId: string;
}

export function LessonDiscussionPanel({ courseId, lessonId }: LessonDiscussionPanelProps) {
    const searchParams = useSearchParams();
    const deepLinkDiscussionId = searchParams.get('discussionId');

    const [sortBy, setSortBy] = useState<SortOption>('recent');
    const scrolledRef = useRef(false);

    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage
    } = useLessonDiscussions({ courseId, lessonId, sortBy });

    const questions = data?.pages.flatMap(page => page.data) || [];
    const totalDiscussions = data?.pages[0]?.meta.total || 0;

    useEffect(() => {
        if (!deepLinkDiscussionId || scrolledRef.current || isLoading) return;

        const targetElement = document.getElementById(`discussion-${deepLinkDiscussionId}`);
        if (targetElement) {
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetElement.classList.add('ring-2', 'ring-primary/50', 'bg-primary/5', 'rounded-lg', 'p-2', 'transition-all');
                setTimeout(() => {
                    targetElement.classList.remove('ring-2', 'ring-primary/50', 'bg-primary/5', 'rounded-lg', 'p-2');
                }, 3000);
            }, 100);
            scrolledRef.current = true;
        }
    }, [deepLinkDiscussionId, questions.length, isLoading]);

    return (
        <div className="w-full bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 md:px-8 border-b border-border/50 bg-muted/10">
                <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MessageCircleQuestion className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-foreground">Hỏi đáp & Thảo luận</h2>
                        <p className="text-xs font-semibold text-muted-foreground">{totalDiscussions} câu hỏi trong bài học này</p>
                    </div>
                </div>

                <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                    <SelectTrigger className="w-[140px] h-9 text-xs font-bold border-border/60 shadow-sm focus:ring-primary/30">
                        <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="recent" className="text-xs font-medium">Mới nhất</SelectItem>
                        <SelectItem value="popular" className="text-xs font-medium">Nổi bật nhất</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="p-5 md:p-8 space-y-8">
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-foreground">Đặt câu hỏi mới</h3>
                    <DiscussionEditor courseId={courseId} lessonId={lessonId} />
                </div>

                <hr className="border-border/40" />

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                        <p className="text-sm text-muted-foreground font-medium">Đang tải thảo luận...</p>
                    </div>
                ) : questions.length === 0 ? (
                    <EmptyDiscussion />
                ) : (
                    <div className="space-y-2">
                        {questions.map((question) => (
                            <DiscussionThread
                                key={question.id}
                                courseId={courseId}
                                lessonId={lessonId}
                                question={question}
                                autoExpand={deepLinkDiscussionId === question.id}
                            />
                        ))}
                    </div>
                )}

                {hasNextPage && (
                    <div className="flex justify-center pt-4">
                        <Button
                            variant="outline"
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="font-bold border-border/60 shadow-sm hover:bg-muted/50 hover:text-primary transition-colors"
                        >
                            {isFetchingNextPage ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang tải...</>
                            ) : (
                                <><ArrowDownCircle className="w-4 h-4 mr-2" /> Tải thêm thảo luận</>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}