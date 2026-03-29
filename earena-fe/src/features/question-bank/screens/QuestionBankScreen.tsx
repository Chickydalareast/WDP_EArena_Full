import React from 'react';
import { FolderSidebar } from '../components/FolderSidebar';
import { QuestionList } from '../components/QuestionList';
import {ErrorBoundary} from '@/shared/components/common/ErrorBoundary'; // Đảm bảo bạn export ErrorBoundary chuẩn

export function QuestionBankScreen() {
    return (
        // Vỏ bọc full màn hình (trừ đi chiều cao Navbar giả định là 64px / 4rem)
        // Ngăn chặn scroll tổng, nhường scroll cho từng cột bên trong
        <div className="h-[calc(100vh-4rem)] w-full flex flex-col md:flex-row bg-white overflow-hidden border-t border-slate-200">

            {/* CỘT TRÁI: CÂY THƯ MỤC (Chiếm 25%, min-width 250px) */}
            <div className="w-full md:w-1/4 lg:w-1/5 min-w-[280px] border-r border-slate-200 h-full shrink-0 relative bg-slate-50/50">
                <ErrorBoundary fallback={
                    <div className="p-6 text-center text-red-500 bg-red-50 h-full flex items-center justify-center">
                        <div>
                            <p className="font-bold">Lỗi Cột Trái</p>
                            <p className="text-sm mt-2">Không thể tải cây thư mục.</p>
                        </div>
                    </div>
                }>
                    <FolderSidebar />
                </ErrorBoundary>
            </div>

            {/* CỘT PHẢI: DANH SÁCH CÂU HỎI & TOOLBAR (Chiếm phần còn lại) */}
            <div className="flex-1 h-full w-full bg-slate-50 relative overflow-hidden">
                <ErrorBoundary fallback={
                    <div className="p-6 text-center text-red-500 bg-red-50 h-full flex items-center justify-center">
                        <div>
                            <p className="font-bold">Lỗi Cột Phải</p>
                            <p className="text-sm mt-2">Không thể tải danh sách câu hỏi.</p>
                        </div>
                    </div>
                }>
                    <QuestionList />
                </ErrorBoundary>
            </div>

        </div>
    );
}