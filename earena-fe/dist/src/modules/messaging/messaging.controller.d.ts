import { MessagingService } from './messaging.service';
import { OpenThreadDto, SendChatMessageDto } from './dto/send-chat-message.dto';
export declare class MessagingController {
    private readonly messagingService;
    constructor(messagingService: MessagingService);
    listThreads(userId: string): Promise<{
        id: any;
        peer: any;
        lastMessageAt: Date;
        unread: boolean;
    }[]>;
    unreadCount(userId: string): Promise<{
        count: number;
    }>;
    shareableCourses(userId: string): Promise<{
        items: {
            id: any;
            title: any;
            slug: any;
            coverUrl: any;
        }[];
    }>;
    openThread(userId: string, dto: OpenThreadDto): Promise<{
        id: any;
        peerUserId: any;
        lastMessageAt: any;
    }>;
    markRead(userId: string, threadId: string): Promise<{
        ok: boolean;
    }>;
    listMessages(userId: string, threadId: string, page?: string, limit?: string): Promise<{
        items: {
            id: any;
            senderId: any;
            body: any;
            imageUrls: any;
            shareCourse: any;
            createdAt: any;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    sendMessage(userId: string, threadId: string, dto: SendChatMessageDto): Promise<{
        id: string;
        senderId: string;
        body: string | null;
        imageUrls: string[];
        shareCourseId: string | null;
        createdAt: any;
    }>;
}
