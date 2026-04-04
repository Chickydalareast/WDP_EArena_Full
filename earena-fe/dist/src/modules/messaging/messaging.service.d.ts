import { Model } from 'mongoose';
import { ChatThreadDocument } from './schemas/chat-thread.schema';
import { ChatMessageDocument } from './schemas/chat-message.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { CourseDocument } from '../courses/schemas/course.schema';
import { EnrollmentDocument } from '../courses/schemas/enrollment.schema';
import { NotificationsService } from '../notifications/notifications.service';
export declare class MessagingService {
    private readonly threadModel;
    private readonly messageModel;
    private readonly userModel;
    private readonly courseModel;
    private readonly enrollmentModel;
    private readonly notificationsService;
    private readonly logger;
    constructor(threadModel: Model<ChatThreadDocument>, messageModel: Model<ChatMessageDocument>, userModel: Model<UserDocument>, courseModel: Model<CourseDocument>, enrollmentModel: Model<EnrollmentDocument>, notificationsService: NotificationsService);
    private threadHasUnread;
    private readAtFieldForUser;
    private bumpReadCursor;
    private assertAllowedPair;
    openOrGetThread(userId: string, peerUserId: string): Promise<{
        id: any;
        peerUserId: any;
        lastMessageAt: any;
    }>;
    listThreads(userId: string): Promise<{
        id: any;
        peer: any;
        lastMessageAt: Date;
        unread: boolean;
    }[]>;
    countUnreadThreads(userId: string): Promise<{
        count: number;
    }>;
    markThreadRead(threadId: string, userId: string): Promise<{
        ok: boolean;
    }>;
    listShareableCourses(userId: string): Promise<{
        items: {
            id: any;
            title: any;
            slug: any;
            coverUrl: any;
        }[];
    }>;
    private assertThreadMember;
    listMessages(threadId: string, userId: string, page?: number, limit?: number): Promise<{
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
    sendMessage(threadId: string, userId: string, dto: {
        body?: string;
        imageUrls?: string[];
        shareCourseId?: string;
    }): Promise<{
        id: string;
        senderId: string;
        body: string | null;
        imageUrls: string[];
        shareCourseId: string | null;
        createdAt: any;
    }>;
    private serializeChatMessageForClient;
    private serializeThread;
}
