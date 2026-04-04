export declare enum CommunityPostType {
    HOMEWORK_QUESTION = "HOMEWORK_QUESTION",
    RESOURCE_SHARE = "RESOURCE_SHARE",
    EXPERIENCE_SHARE = "EXPERIENCE_SHARE",
    COURSE_REVIEW = "COURSE_REVIEW",
    EXAM_DISCUSSION = "EXAM_DISCUSSION",
    COURSE_SHARE = "COURSE_SHARE"
}
export declare enum CommunityPostStatus {
    ACTIVE = "ACTIVE",
    HIDDEN = "HIDDEN",
    REMOVED = "REMOVED"
}
export declare enum CommunityReactionKind {
    HELPFUL = "HELPFUL",
    LOVE = "LOVE",
    QUALITY = "QUALITY",
    SPOT_ON = "SPOT_ON",
    THANKS = "THANKS"
}
export declare enum CommunityReactionTarget {
    POST = "POST",
    COMMENT = "COMMENT"
}
export declare enum CommunityReportTarget {
    POST = "POST",
    COMMENT = "COMMENT"
}
export declare enum CommunityReportStatus {
    PENDING = "PENDING",
    REVIEWED = "REVIEWED",
    DISMISSED = "DISMISSED"
}
export declare enum CommunityFollowTarget {
    USER = "USER",
    SUBJECT = "SUBJECT"
}
export declare enum CommunityUserCommunityStatus {
    ACTIVE = "ACTIVE",
    MUTED = "MUTED",
    BANNED = "BANNED"
}
export declare const COMMUNITY_QUEUE = "community-jobs";
export declare const COMMUNITY_BADGES: {
    readonly FIRST_STEP: "FIRST_STEP";
    readonly HELPFUL_10: "HELPFUL_10";
    readonly CONTRIBUTOR: "CONTRIBUTOR";
    readonly TEACHER_VOICE: "TEACHER_VOICE";
    readonly HOT_POST: "HOT_POST";
};
