'use client';

import { useState, useEffect } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { DiscussionItem } from './DiscussionItem';
import { DiscussionEditor } from './DiscussionEditor';
import { useDiscussionReplies } from '../hooks/useDiscussionReplies';
import { RootQuestion } from '../types/discussion.schema';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface DiscussionThreadProps {
    courseId: string;
    lessonId: string;
    question: RootQuestion;
    autoExpand?: boolean;
}

export function DiscussionThread({ courseId, lessonId, question, autoExpand = false }: DiscussionThreadProps) {
    const [isExpanded, setIsExpanded] = useState(autoExpand);
    const [isReplying, setIsReplying] = useState(false);

    const { data: repliesRes, isLoading } = useDiscussionReplies(
        courseId,
        isExpanded ? question.id : null
    );

    const replies = repliesRes || [];

    useEffect(() => {
        if (autoExpand) {
            setIsExpanded(true);
        }
    }, [autoExpand]);

    const handleToggleExpand = () => setIsExpanded((prev) => !prev);
    const handleToggleReply = () => setIsReplying((prev) => !prev);

    return (
        <div id={`discussion-${question.id}`} className="flex flex-col relative pb-4 mb-4 border-b border-border/50 last:border-0 last:mb-0 last:pb-0 scroll-mt-24">
            {/* VÁ LỖ HỔNG: Truyền courseId xuống cho Question gốc */}
            <DiscussionItem
                item={question}
                isRoot
                courseId={courseId}
                onReplyClick={handleToggleReply}
            />

            {isReplying && (
                <div className="ml-12 md:ml-14 mt-4">
                    <DiscussionEditor
                        courseId={courseId}
                        lessonId={lessonId}
                        parentId={question.id}
                        onCancel={() => setIsReplying(false)}
                        onSuccessCb={() => {
                            setIsReplying(false);
                            setIsExpanded(true);
                        }}
                    />
                </div>
            )}

            {!isExpanded && question.replyCount > 0 && (
                <div className="ml-12 md:ml-14 mt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs font-bold text-primary hover:bg-primary/5 hover:text-primary gap-1.5"
                        onClick={handleToggleExpand}
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Xem {question.replyCount} phản hồi
                    </Button>
                </div>
            )}

            {isExpanded && (
                <div className="ml-12 md:ml-14 mt-4 space-y-4 pl-4 border-l-2 border-muted">
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium py-2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" /> Đang tải phản hồi...
                        </div>
                    ) : (
                        replies.map((reply) => (
                            <DiscussionItem 
                                key={reply.id} 
                                item={reply} 
                                courseId={courseId} // Đảm bảo tính đồng nhất props
                            />
                        ))
                    )}

                    {replies.length > 0 && (
                        <Button
                            variant="link"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto font-medium"
                            onClick={handleToggleExpand}
                        >
                            Thu gọn
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}