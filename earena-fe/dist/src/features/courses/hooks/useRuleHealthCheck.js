"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRuleHealthCheck = void 0;
const react_query_1 = require("@tanstack/react-query");
const course_service_1 = require("../api/course.service");
const useRuleHealthCheck = (payload) => {
    return (0, react_query_1.useQuery)({
        queryKey: ['quiz-rule-health', payload],
        queryFn: async () => {
            if (!payload)
                throw new Error('Missing payload');
            const response = await course_service_1.courseService.previewQuizRule(payload);
            return response.data || response;
        },
        enabled: !!payload && payload.folderIds.length > 0 && payload.limit > 0,
        staleTime: 1000 * 60 * 5,
        retry: 0,
    });
};
exports.useRuleHealthCheck = useRuleHealthCheck;
//# sourceMappingURL=useRuleHealthCheck.js.map