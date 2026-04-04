import { CommunityService } from './community.service';
import { ResolveCommunityReportDto, SetUserCommunityStatusDto } from './dto/community-admin.dto';
import { FeaturePostBodyDto, LockCommentsBodyDto } from './dto/community-id-body.dto';
import { CommunityReportStatus } from './constants/community.constants';
export declare class CommunityAdminController {
    private readonly communityService;
    constructor(communityService: CommunityService);
    hidePost(actorId: string, postId: string): Promise<{
        message: string;
        data: {
            ok: boolean;
        };
    }>;
    showPost(actorId: string, postId: string): Promise<{
        message: string;
        data: {
            ok: boolean;
        };
    }>;
    feature(actorId: string, postId: string, body: FeaturePostBodyDto): Promise<{
        message: string;
        data: {
            ok: boolean;
        };
    }>;
    lockComments(actorId: string, postId: string, body: LockCommentsBodyDto): Promise<{
        message: string;
        data: {
            ok: boolean;
        };
    }>;
    reports(status?: CommunityReportStatus, page?: number, limit?: number): Promise<{
        message: string;
        data: {
            items: {
                id: string;
                reporterId: string;
                reporter: {
                    fullName: any;
                    email: any;
                };
                targetType: import("./constants/community.constants").CommunityReportTarget;
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
        };
    }>;
    resolveReport(actorId: string, reportId: string, dto: ResolveCommunityReportDto): Promise<{
        message: string;
        data: {
            ok: boolean;
        };
    }>;
    userStatus(actorId: string, userId: string, dto: SetUserCommunityStatusDto): Promise<{
        message: string;
        data: {
            ok: boolean;
        };
    }>;
    audit(page?: number, limit?: number): Promise<{
        message: string;
        data: {
            items: (import("./schemas/community-moderation-audit.schema").CommunityModerationAudit & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
                _id: import("mongoose").Types.ObjectId;
            }> & {
                __v: number;
            })[];
            meta: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }>;
}
