import React from 'react';
import { MyCoursesList } from '@/features/courses/components/MyCoursesList';
import { BookOpenCheck } from 'lucide-react';

export const metadata = {
    title: 'Khóa học của tôi | E-Arena',
    description: 'Tiến trình học tập và danh sách khóa học bạn đã ghi danh.',
};

export default function MyCoursesPage() {
    return (
        <div className="max-w-[1600px] w-full mx-auto space-y-8 pb-20 px-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-5 border-b border-border/60 pb-6 mt-8">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <BookOpenCheck className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                        Khóa học của tôi
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1.5 text-sm md:text-base">
                        Tiếp tục tiến trình học tập và chinh phục mục tiêu của bạn.
                    </p>
                </div>
            </div>

            <MyCoursesList />
        </div>
    );
}