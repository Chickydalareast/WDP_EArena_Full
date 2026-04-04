"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthFlowStore = void 0;
const zustand_1 = require("zustand");
exports.useAuthFlowStore = (0, zustand_1.create)((set) => ({
    flowType: 'REGISTER',
    step: 'INPUT_EMAIL',
    email: '',
    ticket: null,
    resendAvailableAt: null,
    role: 'STUDENT',
    startFlow: (type) => set({ flowType: type, step: 'INPUT_EMAIL', email: '', ticket: null }),
    setStep: (step) => set({ step }),
    setEmail: (email) => set({ email }),
    setTicket: (ticket) => set({ ticket }),
    setResendAvailableAt: (timestamp) => set({ resendAvailableAt: timestamp }),
    setEmailAndRole: (email, role) => set({ email, role }),
    resetFlow: () => set({
        flowType: 'REGISTER',
        step: 'INPUT_EMAIL',
        email: '',
        ticket: null,
        resendAvailableAt: null,
        role: 'STUDENT',
    }),
}));
//# sourceMappingURL=auth-flow.store.js.map