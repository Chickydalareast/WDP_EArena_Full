"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBillingUIStore = void 0;
const zustand_1 = require("zustand");
exports.useBillingUIStore = (0, zustand_1.create)((set) => ({
    isDepositModalOpen: false,
    requiredAmount: 0,
    openDepositModal: (amount = 0) => set({ isDepositModalOpen: true, requiredAmount: amount }),
    closeDepositModal: () => set({ isDepositModalOpen: false, requiredAmount: 0 }),
}));
//# sourceMappingURL=billing-ui.store.js.map