'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useExamReview } from '@/features/exam-taking/hooks/useTakeExam';
import { ROUTES } from '@/config/routes';
import { Loader2, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export default function ExamResultPage({ params }: { params: Promise<{ submissionId: string }> }) {
    const router = useRouter();
    // Unbox params (Next.js 15 pattern)
    const resolvedParams = use(params);

    const { data, isLoading, isError } = useExamReview(resolvedParams.submissionId);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <h2 className="text-xl font-bold">Đang tải kết quả thi...</h2>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-slate-800">Không tìm thấy kết quả</h2>
                <p className="text-slate-500 mt-2">Phiên làm bài không tồn tại hoặc bạn không có quyền xem.</p>
                <Button onClick={() => router.push(ROUTES.STUDENT.DASHBOARD)} className="mt-6">
                    Về trang chủ
                </Button>
            </div>
        );
    }

    const summary = data.summary || {};
    const score = summary.score ?? 0;
    const totalQuestions = summary.totalQuestions ?? 0;
    const correctCount = summary.correctCount ?? 0;
    const details = data.details;

    return (
        <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
            {/* NÚT BACK */}
            <Button
                variant="ghost"
                onClick={() => router.push(ROUTES.STUDENT.DASHBOARD)}
                className="pl-0 text-slate-500 hover:text-slate-800"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại lớp học
            </Button>

            {/* HEADER: HIỂN THỊ ĐIỂM SỐ */}
            <div className="bg-white rounded-3xl p-8 border shadow-sm text-center">
                <h1 className="text-2xl font-black text-slate-800 mb-2">Hoàn tất bài thi!</h1>
                <p className="text-slate-500 font-medium mb-8">Hệ thống đã ghi nhận kết quả của bạn.</p>

                <div className="flex justify-center mb-6">
                    <div className="w-40 h-40 rounded-full border-8 border-blue-100 flex items-center justify-center relative bg-white shadow-inner">
                        <div className="text-center">
                            <span className="text-5xl font-black text-blue-600">{score}</span>
                            <span className="text-lg text-slate-400 font-bold">/10</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-8 text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Số câu đúng: {correctCount} / {totalQuestions}</span>
                    </div>
                </div>
            </div>

            {!details ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4 items-start">
                    <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-amber-800 text-lg">Chi tiết bài làm đang bị ẩn</h3>
                        <p className="text-amber-700 mt-1 leading-relaxed">
                            Đợt thi này vẫn đang trong thời gian mở cửa đối với các học sinh khác. Để đảm bảo tính công bằng, chi tiết đối chiếu đáp án Đúng/Sai sẽ được công bố sau khi thời gian đợt thi kết thúc.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 mt-8">
                    <h2 className="text-xl font-bold text-slate-800 border-b pb-4">Chi tiết bài làm</h2>
                    {details.map((item: any, idx: number) => {
                        const isCorrect = item.isCorrect;
                        const studentSelectedId = item.studentSelectedId;
                        const correctAnswerId = item.correctAnswerId;

                        // MAX PING: Dùng ID để móc ngược ra nội dung (content) của đáp án từ mảng answers
                        const studentAnswerObj = item.answers?.find((a: any) => a.id === studentSelectedId);
                        const correctAnswerObj = item.answers?.find((a: any) => a.id === correctAnswerId);

                        // Format chuỗi hiển thị: "A. Nội dung đáp án"
                        const displayStudentAnswer = studentSelectedId
                            ? `${studentSelectedId}. ${studentAnswerObj?.content || ''}`
                            : 'Bỏ trống';

                        const displayCorrectAnswer = correctAnswerId
                            ? `${correctAnswerId}. ${correctAnswerObj?.content || ''}`
                            : 'Chưa cập nhật';

                        return (
                            <div key={item.originalQuestionId || item._id || idx} className={`p-5 rounded-xl border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="flex gap-3 mb-3">
                                    {isCorrect ? <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" /> : <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />}
                                    <p className="font-medium text-slate-800">
                                        <span className="font-bold mr-2">Câu {idx + 1}:</span>
                                        {item.content || 'Nội dung câu hỏi...'}
                                    </p>
                                </div>

                                <div className="ml-8 space-y-2 text-sm mt-4 p-4 rounded-lg bg-white/60 border border-slate-100">
                                    <p className="text-slate-600 flex items-start gap-2">
                                        <span className="whitespace-nowrap w-32">Đáp án bạn chọn:</span>
                                        <span className={`font-bold ${isCorrect ? 'text-green-700' : 'text-red-600'}`}>
                                            {displayStudentAnswer}
                                        </span>
                                    </p>

                                    {!isCorrect && (
                                        <p className="text-slate-600 flex items-start gap-2">
                                            <span className="whitespace-nowrap w-32">Đáp án đúng:</span>
                                            <span className="font-bold text-green-700">
                                                {displayCorrectAnswer}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}