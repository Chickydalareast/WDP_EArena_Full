'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMyCourses = void 0;
const react_query_1 = require("@tanstack/react-query");
const enrollment_service_1 = require("../api/enrollment.service");
const useMyCourses = (page, limit = 10) => {
    return (0, react_query_1.useQuery)({
        queryKey: ['my-learning', page, limit],
        queryFn: () => enrollment_service_1.enrollmentService.getMyLearning(page, limit),
        staleTime: 1000 * 60 * 5,
    });
};
exports.useMyCourses = useMyCourses;
//# sourceMappingURL=useMyCourses.js.map