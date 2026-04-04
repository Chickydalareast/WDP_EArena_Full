"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useExamBuilderStore = void 0;
const zustand_1 = require("zustand");
exports.useExamBuilderStore = (0, zustand_1.create)((set) => ({
    isQuestionBankModalOpen: false,
    setQuestionBankModalOpen: (isOpen) => set({ isQuestionBankModalOpen: isOpen }),
}));
//# sourceMappingURL=exam-builder.store.js.map