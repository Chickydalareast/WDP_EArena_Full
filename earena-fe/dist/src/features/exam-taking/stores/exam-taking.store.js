"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useExamTakingStore = void 0;
const zustand_1 = require("zustand");
exports.useExamTakingStore = (0, zustand_1.create)()((set) => ({
    submissionId: null,
    courseId: null,
    lessonId: null,
    paperId: null,
    answers: {},
    initExamSession: (submissionId, paperId, context, savedAnswers = []) => {
        const hydratedAnswers = savedAnswers.reduce((acc, curr) => {
            acc[curr.questionId] = curr.selectedAnswerId;
            return acc;
        }, {});
        set({
            submissionId,
            courseId: context.courseId,
            lessonId: context.lessonId,
            paperId,
            answers: hydratedAnswers
        });
    },
    selectAnswer: (questionId, answerId) => {
        set((state) => ({
            answers: { ...state.answers, [questionId]: answerId },
        }));
    },
    clearSession: () => {
        set({ submissionId: null, courseId: null, lessonId: null, paperId: null, answers: {} });
    },
}));
//# sourceMappingURL=exam-taking.store.js.map