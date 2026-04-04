"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.examQueryKeys = void 0;
exports.examQueryKeys = {
    all: ['exams'],
    lists: () => [...exports.examQueryKeys.all, 'list'],
    list: (filters) => [...exports.examQueryKeys.lists(), filters],
    details: () => [...exports.examQueryKeys.all, 'detail'],
    detail: (id) => [...exports.examQueryKeys.details(), id],
    papers: () => [...exports.examQueryKeys.all, 'papers'],
    paperDetail: (paperId) => [...exports.examQueryKeys.papers(), paperId],
    paperQuestions: (paperId) => [...exports.examQueryKeys.paperDetail(paperId), 'questions'],
    matrices: () => [...exports.examQueryKeys.all, 'matrices'],
    matrixLists: () => [...exports.examQueryKeys.matrices(), 'list'],
    matrixList: (filters) => [...exports.examQueryKeys.matrixLists(), filters],
    matrixDetail: (id) => [...exports.examQueryKeys.matrices(), 'detail', id],
    activeFilters: (payload) => [...exports.examQueryKeys.all, 'active-filters', payload],
    previewRule: (paperId, payload) => [...exports.examQueryKeys.all, 'preview-rule', paperId, payload],
};
//# sourceMappingURL=query-keys.js.map