export const subscriptionQueryKeys = {
    all: ['subscriptions'] as const,
    plans: () => [...subscriptionQueryKeys.all, 'plans'] as const,
};