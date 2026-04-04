'use client';

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { AdminMatrixViewer } from './AdminMatrixViewer';
import { QuizLivePreviewModal } from '@/features/courses/components/CurriculumBuilder/QuizLivePreviewModal';
import { useAdminDryRunQuiz } from '../hooks/useAdminCourses';
import { parseApiError } from '@/shared/lib/error-parser';
import { buildNestedQuestions, FlatQuestionPreview } from '@/features/courses/lib/quiz-utils';
import { AdminCourseLesson } from '../types/admin.types';

interface AdminDynamicQuizSectionProps {
    courseId: string;
    lesson: AdminCourseLesson;
}

export function AdminDynamicQuizSection({ courseId, lesson }: AdminDynamicQuizSectionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        data: responseData,
        refetch,
        isFetching
    } = useAdminDryRunQuiz(courseId, lesson.id, false);

    const handleDryRun = async () => {
        try {
            const { isError, error, isSuccess, data } = await refetch();

            if (isError) {
                const parsedErr = parseApiError(error);
                toast.error('Lỗi sinh đề (Dry-run)', {
                    description: parsedErr.message
                });
                return;
            }

            if (isSuccess && data) {
                toast.success('Sinh đề nháp thành công', {
                    description: 'Đã hoàn tất giả lập thuật toán bốc đề ngẫu nhiên.'
                });
                setIsModalOpen(true);
            }
        } catch (err) {
            toast.error('Lỗi hệ thống', {
                description: parseApiError(err).message
            });
        }
    };

    const nestedQuestions = useMemo(() => {
        if (!responseData?.data?.questions) return [];
        return buildNestedQuestions(responseData.data.questions as unknown as FlatQuestionPreview[]);
    }, [responseData]);

    const dynamicConfig = lesson.dynamicConfig;
    const sections = dynamicConfig?.adHocSections || [];

    return (
        <div className="w-full mt-8 animate-in fade-in duration-300">
            <AdminMatrixViewer
                sections={sections}
                onDryRun={handleDryRun}
                isDryRunLoading={isFetching}
            />

            <QuizLivePreviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                questions={nestedQuestions}
                totalItems={responseData?.meta?.totalItems || 0}
                totalActualQuestions={responseData?.meta?.totalActualQuestions || 0}
            />
        </div>
    );
}