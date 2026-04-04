'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDynamicPreview = void 0;
const react_query_1 = require("@tanstack/react-query");
const course_service_1 = require("../api/course.service");
const hasValidRule = (sections) => sections.some((section) => section.rules.some((rule) => rule.folderIds.length > 0 && rule.limit >= 1));
const useDynamicPreview = (payload) => {
    const isEnabled = payload !== null &&
        (!!payload.matrixId ||
            (Array.isArray(payload.adHocSections) &&
                payload.adHocSections.length > 0 &&
                hasValidRule(payload.adHocSections)));
    return (0, react_query_1.useQuery)({
        queryKey: ['quiz-builder', 'dry-run-preview', payload],
        queryFn: () => course_service_1.courseService.previewQuizConfig(payload),
        enabled: isEnabled,
        staleTime: 30 * 1000,
        retry: false,
        gcTime: 60 * 1000,
    });
};
exports.useDynamicPreview = useDynamicPreview;
//# sourceMappingURL=useDynamicPreview.js.map