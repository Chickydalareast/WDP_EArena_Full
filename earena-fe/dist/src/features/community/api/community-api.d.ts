export type CommunityPostType = 'HOMEWORK_QUESTION' | 'RESOURCE_SHARE' | 'EXPERIENCE_SHARE' | 'COURSE_REVIEW' | 'EXAM_DISCUSSION' | 'COURSE_SHARE';
export type CommunityFeedSort = 'NEW' | 'HOT' | 'FOLLOWING' | 'FOR_YOU';
export type CommunityReactionKind = 'HELPFUL' | 'LOVE' | 'QUALITY' | 'SPOT_ON' | 'THANKS';
export declare function getCommunityFeed(params: {
    sort?: CommunityFeedSort;
    type?: CommunityPostType;
    subjectId?: string;
    courseId?: string;
    examId?: string;
    q?: string;
    cursor?: string;
    limit?: number;
}): Promise<any>;
export declare function getCommunitySidebar(): Promise<any>;
export declare function getCommunityPost(postId: string): Promise<any>;
export declare function getCommunityPostComments(postId: string): Promise<any>;
export declare function getCommunityPostsByCourse(courseId: string, params?: {
    cursor?: string;
    limit?: number;
}): Promise<any>;
export declare function uploadCommunityImage(file: File): Promise<{
    url: string;
    name?: string;
}>;
export declare function createCommunityPost(body: {
    type: CommunityPostType;
    bodyJson: string;
    attachments?: {
        url: string;
        kind: 'IMAGE' | 'FILE';
        name?: string;
        mime?: string;
    }[];
    tags?: string[];
    subjectId?: string;
    courseId?: string;
    examId?: string;
}): Promise<any>;
export declare function saveCommunityPost(postId: string): Promise<any>;
export declare function unsaveCommunityPost(postId: string): Promise<any>;
export declare function reactCommunityPost(postId: string, kind: CommunityReactionKind): Promise<any>;
export declare function unreactCommunityPost(postId: string): Promise<any>;
export declare function createCommunityComment(postId: string, body: {
    body?: string;
    parentCommentId?: string;
    mentionedUserIds?: string[];
    attachments?: {
        url: string;
        kind: 'IMAGE' | 'FILE';
        name?: string;
        mime?: string;
    }[];
}): Promise<any>;
export declare function reactCommunityComment(commentId: string, kind: CommunityReactionKind): Promise<any>;
export declare function setBestAnswer(postId: string, commentId: string): Promise<any>;
export declare function reportCommunity(payload: {
    targetType: 'POST' | 'COMMENT';
    targetId: string;
    postId?: string;
    reason: string;
}): Promise<any>;
export declare function followCommunity(targetType: 'USER' | 'SUBJECT', targetId: string): Promise<any>;
export declare function unfollowCommunity(targetType: 'USER' | 'SUBJECT', targetId: string): Promise<any>;
export declare function getCommunityProfile(userId: string): Promise<any>;
export declare function getAdminCommunityReports(params?: {
    status?: string;
    page?: number;
    limit?: number;
}): Promise<any>;
export declare function resolveAdminCommunityReport(reportId: string, body: {
    status: string;
    resolutionNote?: string;
}): Promise<any>;
export type TaxonomySubjectRow = {
    _id: string;
    name: string;
    code?: string;
};
export declare function getTaxonomySubjects(): Promise<TaxonomySubjectRow[]>;
export type CommunityFollowRow = {
    targetType: string;
    targetId: string;
};
export declare function getCommunityFollowing(): Promise<CommunityFollowRow[]>;
export declare function adminHideCommunityPost(postId: string): Promise<any>;
export declare function adminShowCommunityPost(postId: string): Promise<any>;
export declare function adminFeatureCommunityPost(postId: string, featured: boolean): Promise<any>;
export declare function adminLockCommunityPostComments(postId: string, locked: boolean): Promise<any>;
export declare function adminSetUserCommunityStatus(userId: string, body: {
    communityStatus: 'ACTIVE' | 'MUTED' | 'BANNED';
    mutedUntil?: string;
    moderationNote?: string;
}): Promise<any>;
export declare function getAdminCommunityAudit(params?: {
    page?: number;
    limit?: number;
}): Promise<any>;
