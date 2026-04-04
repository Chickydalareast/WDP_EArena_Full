"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hydrateQuestionForEdit = void 0;
const mapAnswersWithKeys = (answers = [], questionId, answerKeys) => {
    if (!answers || answers.length === 0) {
        return [
            { id: 'A', content: '', isCorrect: true },
            { id: 'B', content: '', isCorrect: false },
            { id: 'C', content: '', isCorrect: false },
            { id: 'D', content: '', isCorrect: false },
        ];
    }
    if (answerKeys && answerKeys.length > 0) {
        const keyObj = answerKeys.find((k) => k.originalQuestionId === questionId);
        const correctId = keyObj?.correctAnswerId;
        return answers.map((ans) => ({
            id: ans.id,
            content: ans.content,
            isCorrect: ans.id === correctId,
        }));
    }
    return answers.map((ans) => ({
        id: ans.id,
        content: ans.content,
        isCorrect: !!ans.isCorrect,
    }));
};
const extractMediaIds = (mediaList) => {
    if (!mediaList || !Array.isArray(mediaList))
        return [];
    return mediaList.map((m) => m._id);
};
const hydrateQuestionForEdit = (question, answerKeys) => {
    const baseDTO = {
        _id: question._id,
        type: question.type,
        content: question.content || '',
        explanation: question.explanation || '',
        topicId: question.topicId || undefined,
        tags: question.tags || [],
        isDraft: question.isDraft ?? true,
        difficultyLevel: question.difficultyLevel || 'UNKNOWN',
        attachedMedia: extractMediaIds(question.attachedMedia),
    };
    if (question.type === 'PASSAGE') {
        const subQuestionsDTO = (question.subQuestions || []).map((subQ) => ({
            _id: subQ._id,
            content: subQ.content || '',
            explanation: subQ.explanation || '',
            difficultyLevel: subQ.difficultyLevel || 'UNKNOWN',
            attachedMedia: extractMediaIds(subQ.attachedMedia),
            answers: mapAnswersWithKeys(subQ.answers, subQ._id || subQ.originalQuestionId, answerKeys),
        }));
        if (subQuestionsDTO.length === 0) {
            subQuestionsDTO.push({
                content: '',
                difficultyLevel: 'UNKNOWN',
                attachedMedia: [],
                answers: mapAnswersWithKeys([], 'fallback_id'),
            });
        }
        return {
            ...baseDTO,
            type: 'PASSAGE',
            subQuestions: subQuestionsDTO,
        };
    }
    return {
        ...baseDTO,
        type: 'MULTIPLE_CHOICE',
        answers: mapAnswersWithKeys(question.answers, question._id || question.originalQuestionId, answerKeys),
    };
};
exports.hydrateQuestionForEdit = hydrateQuestionForEdit;
//# sourceMappingURL=hydration-utils.js.map