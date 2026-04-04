export type ThreadListItem = {
    id: string;
    peer: {
        id: string;
        fullName: string;
        avatar?: string;
        role: string;
    };
    lastMessageAt: string;
    unread?: boolean;
};
export type ShareableCourseItem = {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
};
export type ChatMessageItem = {
    id: string;
    senderId: string;
    body: string | null;
    imageUrls: string[];
    shareCourse: {
        id: string;
        title: string;
        slug: string;
        coverUrl: string | null;
    } | null;
    createdAt: string;
};
export declare function listThreads(): Promise<ThreadListItem[]>;
export declare function getUnreadCount(): Promise<{
    count: number;
}>;
export declare function listShareableCourses(): Promise<{
    items: ShareableCourseItem[];
}>;
export declare function openThread(peerUserId: string): Promise<{
    id: string;
    peerUserId: string;
}>;
export declare function listMessages(threadId: string, page?: number): Promise<{
    items: ChatMessageItem[];
    meta: {
        total: number;
    };
}>;
export declare function sendMessage(threadId: string, body: {
    body?: string;
    imageUrls?: string[];
    shareCourseId?: string;
}): Promise<any>;
