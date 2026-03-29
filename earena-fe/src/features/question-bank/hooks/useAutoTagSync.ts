'use client';

import { useEffect, useRef } from 'react';
import { useQuestionBankStore } from '../stores/question-bank.store';
import { toast } from 'sonner';
import { PopulatedQuestion } from '@/features/exam-builder/lib/hydration-utils';

export const useAutoTagSync = (fetchedQuestions: PopulatedQuestion[] = []) => {
    const processingIds = useQuestionBankStore(state => state.processingIds);
    const removeProcessingIds = useQuestionBankStore(state => state.removeProcessingIds);
    const clearProcessingIds = useQuestionBankStore(state => state.clearProcessingIds);

    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        if (processingIds.length === 0 || fetchedQuestions.length === 0) return;

        const completedIds: string[] = [];

        fetchedQuestions.forEach(question => {
            const qId = question._id || question.originalQuestionId;

            if (qId && processingIds.includes(qId)) {
                let isCompleted = false;

                if (question.type === 'PASSAGE') {
                    const hasSubQuestions = Array.isArray(question.subQuestions) && question.subQuestions.length > 0;
                    const allSubCompleted = hasSubQuestions && question.subQuestions!.every(
                        sq => sq.difficultyLevel !== 'UNKNOWN'
                    );

                    if (allSubCompleted) isCompleted = true;
                } else {
                    if (question.difficultyLevel && question.difficultyLevel !== 'UNKNOWN') {
                        isCompleted = true;
                    }
                }

                if (isCompleted) {
                    completedIds.push(qId);
                }
            }
        });

        if (completedIds.length > 0) {
            removeProcessingIds(completedIds);
            toast.success('Gắn thẻ hoàn tất!', {
                description: `Đã tự động phân loại thành công ${completedIds.length} câu hỏi.`,
            });
        }
    }, [fetchedQuestions, processingIds, removeProcessingIds]);

    useEffect(() => {
        if (processingIds.length === 0) {
            startTimeRef.current = null;
            return;
        }

        if (!startTimeRef.current) {
            startTimeRef.current = Date.now();
        }

        const interval = setInterval(() => {
            if (startTimeRef.current && (Date.now() - startTimeRef.current > 3 * 60 * 1000)) {
                clearProcessingIds();
                startTimeRef.current = null;
                toast.warning('Quá thời gian xử lý', {
                    description: 'Kết nối với máy chủ AI bị gián đoạn. Đã tự động gỡ trạng thái chờ trên giao diện.',
                });
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [processingIds.length, clearProcessingIds]);
};