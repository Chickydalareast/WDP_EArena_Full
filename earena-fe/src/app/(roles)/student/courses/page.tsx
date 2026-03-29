import React from 'react';
import { MyCoursesList } from '@/features/courses/components/MyCoursesList';
import { BookOpenCheck } from 'lucide-react';

export const metadata = {
    title: 'Khóa học của tôi | E-Arena',
    description: 'Tiến trình học tập và danh sách khóa học bạn đã ghi danh.',
};

export default function MyCoursesPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <BookOpenCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">
                        Khóa học của tôi
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Tiếp tục tiến trình học tập và chinh phục mục tiêu của bạn.
                    </p>
                </div>
            </div>

            <MyCoursesList />
        </div>
    );
}