'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useActiveFilters = void 0;
const react_query_1 = require("@tanstack/react-query");
const exam_builder_service_1 = require("../api/exam-builder.service");
const query_keys_1 = require("../api/query-keys");
const useActiveFilters = (payload) => {
    return (0, react_query_1.useQuery)({
        queryKey: query_keys_1.examQueryKeys.activeFilters(payload),
        queryFn: async ({ signal }) => {
            const cleanPayload = Object.fromEntries(Object.entries(payload).filter(([_, v]) => Array.isArray(v) ? v.length > 0 : v !== undefined));
            return exam_builder_service_1.examBuilderService.getActiveFilters(cleanPayload, { signal });
        },
        staleTime: 60 * 1000,
        retry: (failureCount, error) => {
            if (error?.statusCode === 400 || error?.statusCode === 401)
                return false;
            return failureCount < 2;
        },
    });
};
exports.useActiveFilters = useActiveFilters;
//# sourceMappingURL=useActiveFilters.js.map