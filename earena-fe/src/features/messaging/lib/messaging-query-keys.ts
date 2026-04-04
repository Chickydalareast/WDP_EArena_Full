export const messagingQueryKeys = {
  threads: ['messaging', 'threads'] as const,
  messages: (threadId: string) => ['messaging', 'messages', threadId] as const,
};
