"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthStore = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
exports.useAuthStore = (0, zustand_1.create)()((0, middleware_1.devtools)((set) => ({
    user: null,
    isAuthenticated: false,
    isInitialized: false,
    setAuth: (user) => set({ user, isAuthenticated: true, isInitialized: true }, false, 'auth/setAuth'),
    clearAuth: () => set({ user: null, isAuthenticated: false, isInitialized: true }, false, 'auth/clearAuth'),
    setInitialized: () => set({ isInitialized: true }, false, 'auth/setInit'),
    updateBalance: (newBalance) => set((state) => ({
        user: state.user ? { ...state.user, balance: newBalance } : null,
    }), false, 'auth/updateBalance'),
    updateUserSubscription: ({ planId, planCode, expiresAt }) => set((state) => {
        if (!state.user)
            return state;
        return {
            user: {
                ...state.user,
                subscription: {
                    ...(state.user.subscription || {}),
                    planId,
                    planCode,
                    expiresAt,
                    isExpired: false,
                }
            }
        };
    }, false, 'auth/updateSubscription'),
}), { name: 'AuthStore' }));
//# sourceMappingURL=auth.store.js.map