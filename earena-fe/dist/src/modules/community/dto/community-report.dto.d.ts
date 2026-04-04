import { CommunityReportTarget } from '../constants/community.constants';
export declare class CreateCommunityReportDto {
    targetType: CommunityReportTarget;
    targetId: string;
    postId?: string;
    reason: string;
}
