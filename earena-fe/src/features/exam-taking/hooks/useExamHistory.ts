'use client';

import { useQuery } from '@tanstack/react-query';
import { examHistoryService, examHistoryKeys } from '../api/exam-history.service';

export const useHistoryOverview = () => {
    return useQuery({
        queryKey: examHistoryKeys.overview(),
        queryFn: examHistoryService.getOverview,
        staleTime: 1000 * 60 * 5, // Cache 5 phút
    });
};

export const useLessonAttempts = (lessonId: string, enabled: boolean) => {
    return useQuery({
        queryKey: examHistoryKeys.lesson(lessonId),
        queryFn: () => examHistoryService.getLessonAttempts(lessonId),
        enabled, // Lazy load: Chỉ gọi API khi biến enabled = true (Mở Accordion)
        staleTime: 1000 * 60 * 5,
    });
};