"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamAttemptDetailSchema = exports.ExamHistoryOverviewSchema = void 0;
const zod_1 = require("zod");
exports.ExamHistoryOverviewSchema = zod_1.z.object({
    lessonId: zod_1.z.string(),
    lessonTitle: zod_1.z.string(),
    courseId: zod_1.z.string(),
    courseTitle: zod_1.z.string(),
    attemptsUsed: zod_1.z.number(),
    maxAttempts: zod_1.z.number().nullable().optional(),
    bestScore: zod_1.z.number().nullable().optional(),
    passPercentage: zod_1.z.number().nullable().optional(),
    latestSubmittedAt: zod_1.z.string().nullable().optional(),
    isLatestInProgress: zod_1.z.boolean(),
});
exports.ExamAttemptDetailSchema = zod_1.z.object({
    _id: zod_1.z.string(),
    status: zod_1.z.enum(['IN_PROGRESS', 'COMPLETED']),
    startedAt: zod_1.z.string(),
    submittedAt: zod_1.z.string().nullable().optional(),
    timeSpent: zod_1.z.number().nullable().optional(),
    score: zod_1.z.number().nullable().optional(),
    totalQuestions: zod_1.z.number(),
    correctCount: zod_1.z.number().nullable().optional(),
});
//# sourceMappingURL=exam-history.schema.js.map