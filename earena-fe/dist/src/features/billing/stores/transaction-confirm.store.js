"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTransactionConfirmStore = void 0;
const zustand_1 = require("zustand");
exports.useTransactionConfirmStore = (0, zustand_1.create)((set) => ({
    isOpen: false,
    payload: null,
    openConfirm: (payload) => set({ isOpen: true, payload }),
    closeConfirm: () => set({ isOpen: false, payload: null }),
}));
//# sourceMappingURL=transaction-confirm.store.js.map