import { CommunityPostType } from '../constants/community.constants';
export declare enum CommunityFeedSort {
    NEW = "NEW",
    HOT = "HOT",
    FOLLOWING = "FOLLOWING",
    FOR_YOU = "FOR_YOU"
}
export declare class CommunityFeedQueryDto {
    sort?: CommunityFeedSort;
    type?: CommunityPostType;
    subjectId?: string;
    courseId?: string;
    examId?: string;
    q?: string;
    limit?: number;
    cursor?: string;
}
