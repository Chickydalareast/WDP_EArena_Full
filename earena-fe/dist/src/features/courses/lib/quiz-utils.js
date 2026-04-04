"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildNestedQuestions = void 0;
const buildNestedQuestions = (flatQuestions) => {
    if (!flatQuestions || flatQuestions.length === 0)
        return [];
    const questionMap = new Map();
    const rootQuestions = [];
    flatQuestions.forEach(q => {
        questionMap.set(q.originalQuestionId, { ...q, subQuestions: [] });
    });
    flatQuestions.forEach(q => {
        const node = questionMap.get(q.originalQuestionId);
        if (!node)
            return;
        if (q.parentPassageId) {
            const parent = questionMap.get(q.parentPassageId);
            if (parent && parent.subQuestions) {
                parent.subQuestions.push(node);
            }
        }
        else {
            rootQuestions.push(node);
        }
    });
    return rootQuestions;
};
exports.buildNestedQuestions = buildNestedQuestions;
//# sourceMappingURL=quiz-utils.js.map