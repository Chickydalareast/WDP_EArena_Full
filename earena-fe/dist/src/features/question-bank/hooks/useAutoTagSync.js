'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAutoTagSync = void 0;
const react_1 = require("react");
const question_bank_store_1 = require("../stores/question-bank.store");
const sonner_1 = require("sonner");
const useAutoTagSync = (fetchedQuestions = []) => {
    const processingIds = (0, question_bank_store_1.useQuestionBankStore)(state => state.processingIds);
    const removeProcessingIds = (0, question_bank_store_1.useQuestionBankStore)(state => state.removeProcessingIds);
    const clearProcessingIds = (0, question_bank_store_1.useQuestionBankStore)(state => state.clearProcessingIds);
    const startTimeRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (processingIds.length === 0 || fetchedQuestions.length === 0)
            return;
        const completedIds = [];
        fetchedQuestions.forEach(question => {
            const qId = question._id || question.originalQuestionId;
            if (qId && processingIds.includes(qId)) {
                let isCompleted = false;
                if (question.type === 'PASSAGE') {
                    const hasSubQuestions = Array.isArray(question.subQuestions) && question.subQuestions.length > 0;
                    const allSubCompleted = hasSubQuestions && question.subQuestions.every(sq => sq.difficultyLevel !== 'UNKNOWN');
                    if (allSubCompleted)
                        isCompleted = true;
                }
                else {
                    if (question.difficultyLevel && question.difficultyLevel !== 'UNKNOWN') {
                        isCompleted = true;
                    }
                }
                if (isCompleted) {
                    completedIds.push(qId);
                }
            }
        });
        if (completedIds.length > 0) {
            removeProcessingIds(completedIds);
            sonner_1.toast.success('Gắn thẻ hoàn tất!', {
                description: `Đã tự động phân loại thành công ${completedIds.length} câu hỏi.`,
            });
        }
    }, [fetchedQuestions, processingIds, removeProcessingIds]);
    (0, react_1.useEffect)(() => {
        if (processingIds.length === 0) {
            startTimeRef.current = null;
            return;
        }
        if (!startTimeRef.current) {
            startTimeRef.current = Date.now();
        }
        const interval = setInterval(() => {
            if (startTimeRef.current && (Date.now() - startTimeRef.current > 3 * 60 * 1000)) {
                clearProcessingIds();
                startTimeRef.current = null;
                sonner_1.toast.warning('Quá thời gian xử lý', {
                    description: 'Kết nối với máy chủ AI bị gián đoạn. Đã tự động gỡ trạng thái chờ trên giao diện.',
                });
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [processingIds.length, clearProcessingIds]);
};
exports.useAutoTagSync = useAutoTagSync;
//# sourceMappingURL=useAutoTagSync.js.map