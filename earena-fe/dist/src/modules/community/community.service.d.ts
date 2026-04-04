import { UserDocument } from '../users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { UserRole } from 'src/common/enums/user-role.enum';
import { CoursesRepository } from '../courses/courses.repository';
import { ExamsRepository } from '../exams/exams.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersRepository } from '../users/users.repository';
import { SubjectsService } from '../taxonomy/subjects.service';
import type { ICloudinaryProvider } from '../media/interfaces/storage-provider.interface';
import { CommunityPostDocument } from './schemas/community-post.schema';
import { CommunityComment, CommunityCommentDocument } from './schemas/community-comment.schema';
import { CommunityReactionDocument } from './schemas/community-reaction.schema';
import { CommunitySavedPostDocument } from './schemas/community-saved-post.schema';
import { CommunityReportDocument } from './schemas/community-report.schema';
import { CommunityFollow, CommunityFollowDocument } from './schemas/community-follow.schema';
import { CommunityBlockDocument } from './schemas/community-block.schema';
import { CommunityUserProfileDocument } from './schemas/community-user-profile.schema';
import { CommunityModerationAudit, CommunityModerationAuditDocument } from './schemas/community-moderation-audit.schema';
import { CommunityReactionKind, CommunityReportStatus, CommunityReportTarget, CommunityFollowTarget } from './constants/community.constants';
import { CreateCommunityPostDto, UpdateCommunityPostDto } from './dto/create-community-post.dto';
import { CommunityFeedQueryDto } from './dto/community-feed-query.dto';
import { CreateCommunityCommentDto, UpdateCommunityCommentDto } from './dto/community-comment.dto';
import { CreateCommunityReportDto } from './dto/community-report.dto';
type Actor = {
    userId: string;
    role: UserRole;
    email?: string;
    teacherVerificationStatus?: string;
};
export declare class CommunityService {
    private readonly userModel;
    private readonly postModel;
    private readonly commentModel;
    private readonly reactionModel;
    private readonly savedModel;
    private readonly reportModel;
    private readonly followModel;
    private readonly blockModel;
    private readonly profileModel;
    private readonly auditModel;
    private readonly configService;
    private readonly coursesRepository;
    private readonly examsRepository;
    private readonly notificationsService;
    private readonly usersRepository;
    private readonly subjectsService;
    private readonly cloudinaryProvider;
    constructor(userModel: Model<UserDocument>, postModel: Model<CommunityPostDocument>, commentModel: Model<CommunityCommentDocument>, reactionModel: Model<CommunityReactionDocument>, savedModel: Model<CommunitySavedPostDocument>, reportModel: Model<CommunityReportDocument>, followModel: Model<CommunityFollowDocument>, blockModel: Model<CommunityBlockDocument>, profileModel: Model<CommunityUserProfileDocument>, auditModel: Model<CommunityModerationAuditDocument>, configService: ConfigService, coursesRepository: CoursesRepository, examsRepository: ExamsRepository, notificationsService: NotificationsService, usersRepository: UsersRepository, subjectsService: SubjectsService, cloudinaryProvider: ICloudinaryProvider);
    private readonly communityImageFolder;
    uploadAttachmentImage(userId: string, file: Express.Multer.File): Promise<{
        url: string;
        name: string;
    }>;
    private bannedWords;
    private audit;
    ensureProfile(userId: string): Promise<CommunityUserProfileDocument>;
    private assertCommunityNotRestricted;
    private isVerifiedTeacher;
    private buildCourseSnapshot;
    createPost(actor: Actor, dto: CreateCommunityPostDto): Promise<any>;
    updatePost(actor: Actor, postId: string, dto: UpdateCommunityPostDto): Promise<any>;
    deletePost(actor: Actor, postId: string): Promise<{
        success: boolean;
    }>;
    private blockedAuthorIds;
    getFeed(query: CommunityFeedQueryDto, viewerId?: string | null): Promise<{
        items: any[];
        nextCursor: string | null;
    }>;
    getRecommended(viewerId: string, limit?: number): Promise<{
        items: any[];
        nextCursor: string | null;
    }>;
    private hydratePosts;
    getPostById(postId: string, viewerId?: string | null): Promise<any>;
    listPostsByCourse(courseId: string, viewerId?: string | null, cursor?: string, limit?: number): Promise<{
        items: any[];
        nextCursor: string | null;
    }>;
    savePost(actor: Actor, postId: string): Promise<{
        saved: boolean;
    }>;
    unsavePost(actor: Actor, postId: string): Promise<{
        saved: boolean;
    }>;
    listSaved(actor: Actor, cursor?: string, limit?: number): Promise<{
        items: any[];
        nextCursor: string | null;
    }>;
    private recomputePostHot;
    setPostReaction(actor: Actor, postId: string, kind: CommunityReactionKind): Promise<any>;
    removePostReaction(actor: Actor, postId: string): Promise<any>;
    listComments(postId: string, viewerId?: string | null): Promise<{
        comments: {
            id: string;
            parentCommentId: string | null;
            author: {
                id: string;
                fullName: any;
                avatar: any;
                role: any;
                teacherVerificationStatus: any;
            };
            reactionBreakdown: Record<CommunityReactionKind, number>;
            myReaction: CommunityReactionKind | null;
            postId: Types.ObjectId;
            authorId: Types.ObjectId;
            body: string;
            attachments: {
                url: string;
                kind: "IMAGE" | "FILE";
                name?: string;
                mime?: string;
            }[];
            mentionedUserIds: Types.ObjectId[];
            isTeacherAnswer: boolean;
            isPinned: boolean;
            isRemoved: boolean;
            reactionCount: number;
            _id: Types.ObjectId;
            $locals: Record<string, unknown>;
            $op: "save" | "validate" | "remove" | null;
            $where: Record<string, unknown>;
            baseModelName?: string;
            collection: import("mongoose").Collection;
            db: import("mongoose").Connection;
            errors?: import("mongoose").Error.ValidationError;
            isNew: boolean;
            schema: import("mongoose").Schema;
            __v: number;
        }[];
        bestAnswerCommentId: string | null;
        pinnedCommentId: string | null;
    }>;
    createComment(actor: Actor, postId: string, dto: CreateCommunityCommentDto): Promise<import("mongoose").Document<unknown, {}, CommunityCommentDocument, {}, import("mongoose").DefaultSchemaOptions> & CommunityComment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateComment(actor: Actor, commentId: string, dto: UpdateCommunityCommentDto): Promise<import("mongoose").Document<unknown, {}, CommunityCommentDocument, {}, import("mongoose").DefaultSchemaOptions> & CommunityComment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    deleteComment(actor: Actor, commentId: string): Promise<{
        success: boolean;
    }>;
    setCommentReaction(actor: Actor, commentId: string, kind: CommunityReactionKind): Promise<{
        ok: boolean;
    }>;
    removeCommentReaction(actor: Actor, commentId: string): Promise<{
        ok: boolean;
    }>;
    setBestAnswer(actor: Actor, postId: string, commentId: string): Promise<{
        comments: {
            id: string;
            parentCommentId: string | null;
            author: {
                id: string;
                fullName: any;
                avatar: any;
                role: any;
                teacherVerificationStatus: any;
            };
            reactionBreakdown: Record<CommunityReactionKind, number>;
            myReaction: CommunityReactionKind | null;
            postId: Types.ObjectId;
            authorId: Types.ObjectId;
            body: string;
            attachments: {
                url: string;
                kind: "IMAGE" | "FILE";
                name?: string;
                mime?: string;
            }[];
            mentionedUserIds: Types.ObjectId[];
            isTeacherAnswer: boolean;
            isPinned: boolean;
            isRemoved: boolean;
            reactionCount: number;
            _id: Types.ObjectId;
            $locals: Record<string, unknown>;
            $op: "save" | "validate" | "remove" | null;
            $where: Record<string, unknown>;
            baseModelName?: string;
            collection: import("mongoose").Collection;
            db: import("mongoose").Connection;
            errors?: import("mongoose").Error.ValidationError;
            isNew: boolean;
            schema: import("mongoose").Schema;
            __v: number;
        }[];
        bestAnswerCommentId: string | null;
        pinnedCommentId: string | null;
    }>;
    pinComment(actor: Actor, postId: string, commentId: string): Promise<{
        comments: {
            id: string;
            parentCommentId: string | null;
            author: {
                id: string;
                fullName: any;
                avatar: any;
                role: any;
                teacherVerificationStatus: any;
            };
            reactionBreakdown: Record<CommunityReactionKind, number>;
            myReaction: CommunityReactionKind | null;
            postId: Types.ObjectId;
            authorId: Types.ObjectId;
            body: string;
            attachments: {
                url: string;
                kind: "IMAGE" | "FILE";
                name?: string;
                mime?: string;
            }[];
            mentionedUserIds: Types.ObjectId[];
            isTeacherAnswer: boolean;
            isPinned: boolean;
            isRemoved: boolean;
            reactionCount: number;
            _id: Types.ObjectId;
            $locals: Record<string, unknown>;
            $op: "save" | "validate" | "remove" | null;
            $where: Record<string, unknown>;
            baseModelName?: string;
            collection: import("mongoose").Collection;
            db: import("mongoose").Connection;
            errors?: import("mongoose").Error.ValidationError;
            isNew: boolean;
            schema: import("mongoose").Schema;
            __v: number;
        }[];
        bestAnswerCommentId: string | null;
        pinnedCommentId: string | null;
    }>;
    unpinComment(actor: Actor, postId: string): Promise<{
        comments: {
            id: string;
            parentCommentId: string | null;
            author: {
                id: string;
                fullName: any;
                avatar: any;
                role: any;
                teacherVerificationStatus: any;
            };
            reactionBreakdown: Record<CommunityReactionKind, number>;
            myReaction: CommunityReactionKind | null;
            postId: Types.ObjectId;
            authorId: Types.ObjectId;
            body: string;
            attachments: {
                url: string;
                kind: "IMAGE" | "FILE";
                name?: string;
                mime?: string;
            }[];
            mentionedUserIds: Types.ObjectId[];
            isTeacherAnswer: boolean;
            isPinned: boolean;
            isRemoved: boolean;
            reactionCount: number;
            _id: Types.ObjectId;
            $locals: Record<string, unknown>;
            $op: "save" | "validate" | "remove" | null;
            $where: Record<string, unknown>;
            baseModelName?: string;
            collection: import("mongoose").Collection;
            db: import("mongoose").Connection;
            errors?: import("mongoose").Error.ValidationError;
            isNew: boolean;
            schema: import("mongoose").Schema;
            __v: number;
        }[];
        bestAnswerCommentId: string | null;
        pinnedCommentId: string | null;
    }>;
    createReport(actor: Actor, dto: CreateCommunityReportDto): Promise<{
        success: boolean;
    }>;
    follow(actor: Actor, targetType: CommunityFollowTarget, targetId: string): Promise<{
        following: boolean;
    }>;
    unfollow(actor: Actor, targetType: CommunityFollowTarget, targetId: string): Promise<{
        following: boolean;
    }>;
    listFollowing(actor: Actor): Promise<(CommunityFollow & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    blockUser(actor: Actor, blockedUserId: string): Promise<{
        blocked: boolean;
    }>;
    unblockUser(actor: Actor, blockedUserId: string): Promise<{
        blocked: boolean;
    }>;
    getProfile(userId: string, viewerId?: string | null): Promise<{
        user: {
            id: string;
            fullName: string | undefined;
            avatar: string | undefined;
            role: string | undefined;
            teacherVerificationStatus: string | undefined;
            bio: string | undefined;
        };
        community: {
            reputation: number;
            badges: string[];
            postsCount: number;
            commentsCount: number;
            helpfulReceived: number;
        };
        posts: any[];
        following: boolean;
    }>;
    sidebar(viewerId?: string | null): Promise<{
        featuredPosts: any[];
        topContributors: {
            userId: string;
            reputation: number;
            badges: string[];
            user: any;
        }[];
        hotCourseShareCounts: any[];
        subjectsDirectory: {
            subjectId: string;
            postCount: number;
            name: string;
            code: string | undefined;
        }[];
    }>;
    adminHidePost(actorId: string, postId: string): Promise<{
        ok: boolean;
    }>;
    adminShowPost(actorId: string, postId: string): Promise<{
        ok: boolean;
    }>;
    adminFeaturePost(actorId: string, postId: string, featured: boolean): Promise<{
        ok: boolean;
    }>;
    adminLockComments(actorId: string, postId: string, locked: boolean): Promise<{
        ok: boolean;
    }>;
    adminListReports(status?: CommunityReportStatus, page?: number, limit?: number): Promise<{
        items: {
            id: string;
            reporterId: string;
            reporter: {
                fullName: any;
                email: any;
            };
            targetType: CommunityReportTarget;
            targetId: string;
            postId: any;
            reason: string;
            status: CommunityReportStatus;
            createdAt: any;
            resolutionNote: string | undefined;
            targetPreview: Record<string, unknown>;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    adminResolveReport(actorId: string, reportId: string, status: CommunityReportStatus, note?: string): Promise<{
        ok: boolean;
    }>;
    adminSetUserCommunityStatus(actorId: string, userId: string, dto: import('./dto/community-admin.dto').SetUserCommunityStatusDto): Promise<{
        ok: boolean;
    }>;
    adminAuditLog(page?: number, limit?: number): Promise<{
        items: (CommunityModerationAudit & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    runWeeklyDigestBatch(): Promise<{
        processed: number;
    }>;
}
export {};
