"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMUNITY_BADGES = exports.COMMUNITY_QUEUE = exports.CommunityUserCommunityStatus = exports.CommunityFollowTarget = exports.CommunityReportStatus = exports.CommunityReportTarget = exports.CommunityReactionTarget = exports.CommunityReactionKind = exports.CommunityPostStatus = exports.CommunityPostType = void 0;
var CommunityPostType;
(function (CommunityPostType) {
    CommunityPostType["HOMEWORK_QUESTION"] = "HOMEWORK_QUESTION";
    CommunityPostType["RESOURCE_SHARE"] = "RESOURCE_SHARE";
    CommunityPostType["EXPERIENCE_SHARE"] = "EXPERIENCE_SHARE";
    CommunityPostType["COURSE_REVIEW"] = "COURSE_REVIEW";
    CommunityPostType["EXAM_DISCUSSION"] = "EXAM_DISCUSSION";
    CommunityPostType["COURSE_SHARE"] = "COURSE_SHARE";
})(CommunityPostType || (exports.CommunityPostType = CommunityPostType = {}));
var CommunityPostStatus;
(function (CommunityPostStatus) {
    CommunityPostStatus["ACTIVE"] = "ACTIVE";
    CommunityPostStatus["HIDDEN"] = "HIDDEN";
    CommunityPostStatus["REMOVED"] = "REMOVED";
})(CommunityPostStatus || (exports.CommunityPostStatus = CommunityPostStatus = {}));
var CommunityReactionKind;
(function (CommunityReactionKind) {
    CommunityReactionKind["HELPFUL"] = "HELPFUL";
    CommunityReactionKind["LOVE"] = "LOVE";
    CommunityReactionKind["QUALITY"] = "QUALITY";
    CommunityReactionKind["SPOT_ON"] = "SPOT_ON";
    CommunityReactionKind["THANKS"] = "THANKS";
})(CommunityReactionKind || (exports.CommunityReactionKind = CommunityReactionKind = {}));
var CommunityReactionTarget;
(function (CommunityReactionTarget) {
    CommunityReactionTarget["POST"] = "POST";
    CommunityReactionTarget["COMMENT"] = "COMMENT";
})(CommunityReactionTarget || (exports.CommunityReactionTarget = CommunityReactionTarget = {}));
var CommunityReportTarget;
(function (CommunityReportTarget) {
    CommunityReportTarget["POST"] = "POST";
    CommunityReportTarget["COMMENT"] = "COMMENT";
})(CommunityReportTarget || (exports.CommunityReportTarget = CommunityReportTarget = {}));
var CommunityReportStatus;
(function (CommunityReportStatus) {
    CommunityReportStatus["PENDING"] = "PENDING";
    CommunityReportStatus["REVIEWED"] = "REVIEWED";
    CommunityReportStatus["DISMISSED"] = "DISMISSED";
})(CommunityReportStatus || (exports.CommunityReportStatus = CommunityReportStatus = {}));
var CommunityFollowTarget;
(function (CommunityFollowTarget) {
    CommunityFollowTarget["USER"] = "USER";
    CommunityFollowTarget["SUBJECT"] = "SUBJECT";
})(CommunityFollowTarget || (exports.CommunityFollowTarget = CommunityFollowTarget = {}));
var CommunityUserCommunityStatus;
(function (CommunityUserCommunityStatus) {
    CommunityUserCommunityStatus["ACTIVE"] = "ACTIVE";
    CommunityUserCommunityStatus["MUTED"] = "MUTED";
    CommunityUserCommunityStatus["BANNED"] = "BANNED";
})(CommunityUserCommunityStatus || (exports.CommunityUserCommunityStatus = CommunityUserCommunityStatus = {}));
exports.COMMUNITY_QUEUE = 'community-jobs';
exports.COMMUNITY_BADGES = {
    FIRST_STEP: 'FIRST_STEP',
    HELPFUL_10: 'HELPFUL_10',
    CONTRIBUTOR: 'CONTRIBUTOR',
    TEACHER_VOICE: 'TEACHER_VOICE',
    HOT_POST: 'HOT_POST',
};
//# sourceMappingURL=community.constants.js.map