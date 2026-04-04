"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUpgradeUIStore = void 0;
const zustand_1 = require("zustand");
exports.useUpgradeUIStore = (0, zustand_1.create)((set) => ({
    isOpen: false,
    message: null,
    openModal: (message) => set({ isOpen: true, message: message || 'Vui lòng nâng cấp gói cước để tiếp tục.' }),
    closeModal: () => set({ isOpen: false, message: null }),
}));
//# sourceMappingURL=upgrade-ui.store.js.map