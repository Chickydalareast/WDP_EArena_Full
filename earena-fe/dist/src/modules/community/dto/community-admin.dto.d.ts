import { CommunityReportStatus } from '../constants/community.constants';
import { CommunityUserCommunityStatus } from '../constants/community.constants';
export declare class ResolveCommunityReportDto {
    status: CommunityReportStatus;
    resolutionNote?: string;
}
export declare class SetUserCommunityStatusDto {
    communityStatus: CommunityUserCommunityStatus;
    mutedUntil?: string;
    moderationNote?: string;
}
