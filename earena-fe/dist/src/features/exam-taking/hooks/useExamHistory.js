'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLessonAttempts = exports.useHistoryOverview = void 0;
const react_query_1 = require("@tanstack/react-query");
const exam_history_service_1 = require("../api/exam-history.service");
const useHistoryOverview = () => {
    return (0, react_query_1.useQuery)({
        queryKey: exam_history_service_1.examHistoryKeys.overview(),
        queryFn: exam_history_service_1.examHistoryService.getOverview,
        staleTime: 1000 * 60 * 5,
    });
};
exports.useHistoryOverview = useHistoryOverview;
const useLessonAttempts = (lessonId, enabled) => {
    return (0, react_query_1.useQuery)({
        queryKey: exam_history_service_1.examHistoryKeys.lesson(lessonId),
        queryFn: () => exam_history_service_1.examHistoryService.getLessonAttempts(lessonId),
        enabled,
        staleTime: 1000 * 60 * 5,
    });
};
exports.useLessonAttempts = useLessonAttempts;
//# sourceMappingURL=useExamHistory.js.map