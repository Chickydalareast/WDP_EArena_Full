"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMUNITY_BADGE_LABELS = void 0;
exports.formatCommunityBadges = formatCommunityBadges;
exports.COMMUNITY_BADGE_LABELS = {
    FIRST_STEP: 'Bước đầu tiên',
    HELPFUL_10: '10 lần hữu ích',
    CONTRIBUTOR: 'Cộng tác viên',
    TEACHER_VOICE: 'Giáo viên',
    HOT_POST: 'Bài hot',
};
function formatCommunityBadges(badges) {
    if (!badges?.length)
        return '—';
    return badges.map((b) => exports.COMMUNITY_BADGE_LABELS[b] || b).join(' · ');
}
//# sourceMappingURL=community-badge-labels.js.map