import { z } from 'zod';

export const ExamHistoryOverviewSchema = z.object({
    lessonId: z.string(),
    lessonTitle: z.string(),
    courseId: z.string(),
    courseTitle: z.string(),
    attemptsUsed: z.number(),
    maxAttempts: z.number().nullable().optional(),
    bestScore: z.number().nullable().optional(),
    passPercentage: z.number().nullable().optional(),
    latestSubmittedAt: z.string().nullable().optional(),
    isLatestInProgress: z.boolean(),
});

export type ExamHistoryOverview = z.infer<typeof ExamHistoryOverviewSchema>;

export const ExamAttemptDetailSchema = z.object({
    _id: z.string(),
    status: z.enum(['IN_PROGRESS', 'COMPLETED']),
    startedAt: z.string(),
    submittedAt: z.string().nullable().optional(),
    timeSpent: z.number().nullable().optional(),
    score: z.number().nullable().optional(),
    totalQuestions: z.number(),
    correctCount: z.number().nullable().optional(),
});

export type ExamAttemptDetail = z.infer<typeof ExamAttemptDetailSchema>;