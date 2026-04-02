'use client';

import { useQuery } from '@tanstack/react-query';
import { examBuilderService } from '../api/exam-builder.service';
import { ActiveFiltersPayloadDTO } from '../types/exam.schema';
import { examQueryKeys } from '../api/query-keys';

export const useActiveFilters = (payload: ActiveFiltersPayloadDTO) => {
    return useQuery({
        queryKey: examQueryKeys.activeFilters(payload),

        queryFn: async ({ signal }) => {
            const cleanPayload = Object.fromEntries(
                Object.entries(payload).filter(([_, v]) => Array.isArray(v) ? v.length > 0 : v !== undefined)
            ) as ActiveFiltersPayloadDTO;

            return examBuilderService.getActiveFilters(cleanPayload, { signal });
        },

        staleTime: 60 * 1000,
        retry: (failureCount, error: any) => {
            if (error?.statusCode === 400 || error?.statusCode === 401) return false;
            return failureCount < 2;
        },
    });
};