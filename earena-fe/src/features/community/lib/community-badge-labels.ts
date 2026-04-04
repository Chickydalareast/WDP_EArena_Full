export const COMMUNITY_BADGE_LABELS: Record<string, string> = {
  FIRST_STEP: 'Bước đầu tiên',
  HELPFUL_10: '10 lần hữu ích',
  CONTRIBUTOR: 'Cộng tác viên',
  TEACHER_VOICE: 'Giáo viên',
  HOT_POST: 'Bài hot',
};

export function formatCommunityBadges(badges: string[] | undefined) {
  if (!badges?.length) return '—';
  return badges.map((b) => COMMUNITY_BADGE_LABELS[b] || b).join(' · ');
}
