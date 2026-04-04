"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMatrixErrorStore = void 0;
const zustand_1 = require("zustand");
exports.useMatrixErrorStore = (0, zustand_1.create)((set) => ({
    isOpen: false,
    errorMessage: '',
    showError: (message) => set({ isOpen: true, errorMessage: message }),
    closeError: () => set({ isOpen: false, errorMessage: '' }),
}));
//# sourceMappingURL=matrix-error.store.js.map