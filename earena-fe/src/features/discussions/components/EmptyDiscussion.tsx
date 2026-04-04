'use client';

import { MessageSquareDashed } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface EmptyDiscussionProps {
    className?: string;
}

export function EmptyDiscussion({ className }: EmptyDiscussionProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center bg-card rounded-2xl border border-dashed border-border shadow-sm", className)}>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageSquareDashed className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Chưa có thảo luận nào</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
                Hãy là người đầu tiên đặt câu hỏi hoặc chia sẻ kiến thức trong bài học này!
            </p>
        </div>
    );
}