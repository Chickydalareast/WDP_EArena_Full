export enum CommunityPostType {
  HOMEWORK_QUESTION = 'HOMEWORK_QUESTION',
  RESOURCE_SHARE = 'RESOURCE_SHARE',
  EXPERIENCE_SHARE = 'EXPERIENCE_SHARE',
  COURSE_REVIEW = 'COURSE_REVIEW',
  EXAM_DISCUSSION = 'EXAM_DISCUSSION',
  COURSE_SHARE = 'COURSE_SHARE',
}

export enum CommunityPostStatus {
  ACTIVE = 'ACTIVE',
  HIDDEN = 'HIDDEN',
  REMOVED = 'REMOVED',
}

export enum CommunityReactionKind {
  HELPFUL = 'HELPFUL',
  LOVE = 'LOVE',
  QUALITY = 'QUALITY',
  SPOT_ON = 'SPOT_ON',
  THANKS = 'THANKS',
}

export enum CommunityReactionTarget {
  POST = 'POST',
  COMMENT = 'COMMENT',
}

export enum CommunityReportTarget {
  POST = 'POST',
  COMMENT = 'COMMENT',
}

export enum CommunityReportStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  DISMISSED = 'DISMISSED',
}

export enum CommunityFollowTarget {
  USER = 'USER',
  SUBJECT = 'SUBJECT',
}

export enum CommunityUserCommunityStatus {
  ACTIVE = 'ACTIVE',
  MUTED = 'MUTED',
  BANNED = 'BANNED',
}

export const COMMUNITY_QUEUE = 'community-jobs';

export const COMMUNITY_BADGES = {
  FIRST_STEP: 'FIRST_STEP',
  HELPFUL_10: 'HELPFUL_10',
  CONTRIBUTOR: 'CONTRIBUTOR',
  TEACHER_VOICE: 'TEACHER_VOICE',
  HOT_POST: 'HOT_POST',
} as const;
