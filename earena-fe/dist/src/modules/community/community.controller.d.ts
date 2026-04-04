import { UserRole } from 'src/common/enums/user-role.enum';
import { CommunityService } from './community.service';
import { CreateCommunityPostDto, UpdateCommunityPostDto } from './dto/create-community-post.dto';
import { CommunityFeedQueryDto } from './dto/community-feed-query.dto';
import { CreateCommunityCommentDto, UpdateCommunityCommentDto } from './dto/community-comment.dto';
import { CommunityReactDto } from './dto/community-react.dto';
import { CreateCommunityReportDto } from './dto/community-report.dto';
import { CommunityFollowDto } from './dto/community-follow.dto';
import { CommunityFollowTarget } from './constants/community.constants';
import { CommentIdBodyDto } from './dto/community-id-body.dto';
type ReqUser = {
    userId: string;
    role: UserRole;
    email?: string;
    teacherVerificationStatus?: string;
};
export declare class CommunityController {
    private readonly communityService;
    constructor(communityService: CommunityService);
    private actor;
    feed(query: CommunityFeedQueryDto, userId: string | null): Promise<{
        message: string;
        data: {
            items: any[];
            nextCursor: string | null;
        };
    }>;
    sidebar(userId: string | null): Promise<{
        message: string;
        data: {
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
        };
    }>;
    recommended(userId: string, limit?: number): Promise<{
        message: string;
        data: {
            items: any[];
            nextCursor: string | null;
        };
    }>;
    postsByCourse(courseId: string, cursor: string, limit: number, userId: string | null): Promise<{
        message: string;
        data: {
            items: any[];
            nextCursor: string | null;
        };
    }>;
    getPost(postId: string, userId: string | null): Promise<{
        message: string;
        data: any;
    }>;
    listComments(postId: string, userId: string | null): Promise<{
        message: string;
        data: {
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
                reactionBreakdown: Record<import("./constants/community.constants").CommunityReactionKind, number>;
                myReaction: import("./constants/community.constants").CommunityReactionKind | null;
                postId: import("mongoose").Types.ObjectId;
                authorId: import("mongoose").Types.ObjectId;
                body: string;
                attachments: {
                    url: string;
                    kind: "IMAGE" | "FILE";
                    name?: string;
                    mime?: string;
                }[];
                mentionedUserIds: import("mongoose").Types.ObjectId[];
                isTeacherAnswer: boolean;
                isPinned: boolean;
                isRemoved: boolean;
                reactionCount: number;
                _id: import("mongoose").Types.ObjectId;
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
        };
    }>;
    profile(userId: string, viewerId: string | null): Promise<{
        message: string;
        data: {
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
        };
    }>;
    uploadPostImage(userId: string, file: Express.Multer.File): Promise<{
        message: string;
        data: {
            url: string;
            name: string;
        };
    }>;
    createPost(user: ReqUser, dto: CreateCommunityPostDto): Promise<{
        message: string;
        data: any;
    }>;
    updatePost(user: ReqUser, postId: string, dto: UpdateCommunityPostDto): Promise<{
        message: string;
        data: any;
    }>;
    deletePost(user: ReqUser, postId: string): Promise<{
        message: string;
        data: {
            success: boolean;
        };
    }>;
    savePost(user: ReqUser, postId: string): Promise<{
        message: string;
        data: {
            saved: boolean;
        };
    }>;
    unsavePost(user: ReqUser, postId: string): Promise<{
        message: string;
        data: {
            saved: boolean;
        };
    }>;
    saved(user: ReqUser, cursor: string, limit: number): Promise<{
        message: string;
        data: {
            items: any[];
            nextCursor: string | null;
        };
    }>;
    reactPost(user: ReqUser, postId: string, dto: CommunityReactDto): Promise<{
        message: string;
        data: any;
    }>;
    unreactPost(user: ReqUser, postId: string): Promise<{
        message: string;
        data: any;
    }>;
    createComment(user: ReqUser, postId: string, dto: CreateCommunityCommentDto): Promise<{
        message: string;
        data: import("mongoose").Document<unknown, {}, import("./schemas/community-comment.schema").CommunityCommentDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/community-comment.schema").CommunityComment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    updateComment(user: ReqUser, commentId: string, dto: UpdateCommunityCommentDto): Promise<{
        message: string;
        data: import("mongoose").Document<unknown, {}, import("./schemas/community-comment.schema").CommunityCommentDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/community-comment.schema").CommunityComment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    deleteComment(user: ReqUser, commentId: string): Promise<{
        message: string;
        data: {
            success: boolean;
        };
    }>;
    reactComment(user: ReqUser, commentId: string, dto: CommunityReactDto): Promise<{
        message: string;
        data: {
            ok: boolean;
        };
    }>;
    unreactComment(user: ReqUser, commentId: string): Promise<{
        message: string;
        data: {
            ok: boolean;
        };
    }>;
    bestAnswer(user: ReqUser, postId: string, body: CommentIdBodyDto): Promise<{
        message: string;
        data: {
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
                reactionBreakdown: Record<import("./constants/community.constants").CommunityReactionKind, number>;
                myReaction: import("./constants/community.constants").CommunityReactionKind | null;
                postId: import("mongoose").Types.ObjectId;
                authorId: import("mongoose").Types.ObjectId;
                body: string;
                attachments: {
                    url: string;
                    kind: "IMAGE" | "FILE";
                    name?: string;
                    mime?: string;
                }[];
                mentionedUserIds: import("mongoose").Types.ObjectId[];
                isTeacherAnswer: boolean;
                isPinned: boolean;
                isRemoved: boolean;
                reactionCount: number;
                _id: import("mongoose").Types.ObjectId;
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
        };
    }>;
    pinComment(user: ReqUser, postId: string, body: CommentIdBodyDto): Promise<{
        message: string;
        data: {
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
                reactionBreakdown: Record<import("./constants/community.constants").CommunityReactionKind, number>;
                myReaction: import("./constants/community.constants").CommunityReactionKind | null;
                postId: import("mongoose").Types.ObjectId;
                authorId: import("mongoose").Types.ObjectId;
                body: string;
                attachments: {
                    url: string;
                    kind: "IMAGE" | "FILE";
                    name?: string;
                    mime?: string;
                }[];
                mentionedUserIds: import("mongoose").Types.ObjectId[];
                isTeacherAnswer: boolean;
                isPinned: boolean;
                isRemoved: boolean;
                reactionCount: number;
                _id: import("mongoose").Types.ObjectId;
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
        };
    }>;
    unpinComment(user: ReqUser, postId: string): Promise<{
        message: string;
        data: {
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
                reactionBreakdown: Record<import("./constants/community.constants").CommunityReactionKind, number>;
                myReaction: import("./constants/community.constants").CommunityReactionKind | null;
                postId: import("mongoose").Types.ObjectId;
                authorId: import("mongoose").Types.ObjectId;
                body: string;
                attachments: {
                    url: string;
                    kind: "IMAGE" | "FILE";
                    name?: string;
                    mime?: string;
                }[];
                mentionedUserIds: import("mongoose").Types.ObjectId[];
                isTeacherAnswer: boolean;
                isPinned: boolean;
                isRemoved: boolean;
                reactionCount: number;
                _id: import("mongoose").Types.ObjectId;
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
        };
    }>;
    report(user: ReqUser, dto: CreateCommunityReportDto): Promise<{
        message: string;
        data: {
            success: boolean;
        };
    }>;
    follow(user: ReqUser, dto: CommunityFollowDto): Promise<{
        message: string;
        data: {
            following: boolean;
        };
    }>;
    unfollow(user: ReqUser, targetType: CommunityFollowTarget, targetId: string): Promise<{
        message: string;
        data: {
            following: boolean;
        };
    }>;
    following(user: ReqUser): Promise<{
        message: string;
        data: (import("./schemas/community-follow.schema").CommunityFollow & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
    block(user: ReqUser, blockedUserId: string): Promise<{
        message: string;
        data: {
            blocked: boolean;
        };
    }>;
    unblock(user: ReqUser, blockedUserId: string): Promise<{
        message: string;
        data: {
            blocked: boolean;
        };
    }>;
}
export {};
