import React from 'react';
import { ExamHistoryList } from '@/features/exam-taking/components/history/ExamHistoryList';
import { History } from 'lucide-react';

export const metadata = {
    title: 'Lịch sử làm bài | E-Arena',
    description: 'Xem lại lịch sử, điểm số và chi tiết các bài kiểm tra đã thực hiện.',
};

export default function StudentHistoryPage() {
    return (
        <div className="max-w-[1200px] w-full mx-auto space-y-8 pb-20 px-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-5 border-b border-border/60 pb-6 mt-8">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                    <History className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                        Lịch sử làm bài
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1.5 text-sm md:text-base">
                        Theo dõi tiến độ, xem lại kết quả và rút kinh nghiệm từ các lần thi trước.
                    </p>
                </div>
            </div>

            <ExamHistoryList />
        </div>
    );
}