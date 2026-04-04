"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionQueryKeys = void 0;
exports.subscriptionQueryKeys = {
    all: ['subscriptions'],
    plans: () => [...exports.subscriptionQueryKeys.all, 'plans'],
};
//# sourceMappingURL=subscription-keys.js.map