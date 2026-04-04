export declare const messagingQueryKeys: {
    threads: readonly ["messaging", "threads"];
    messages: (threadId: string) => readonly ["messaging", "messages", string];
};
