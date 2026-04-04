import { CommunityReactionKind } from '../constants/community.constants';

/** Hỗ trợ cả Tiptap JSON hoặc HTML (frontend legacy). */
export function derivePlainFromCommunityBody(raw: string): string {
  const t = raw?.trim();
  if (!t) return '';
  if (t.startsWith('{')) {
    const fromJson = extractPlainFromTiptapJson(t);
    if (fromJson) return fromJson;
  }
  return t
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20000);
}

/** Trả về `null` nếu không đủ nội dung (chữ hoặc ảnh). */
export function resolvePostBodyPlainForSave(
  bodyJson: string,
  attachments?: { kind: string; url?: string }[],
): string | null {
  let bodyPlain = derivePlainFromCommunityBody(bodyJson);
  const hasImage = (attachments || []).some(
    (a) =>
      a.kind === 'IMAGE' &&
      typeof a.url === 'string' &&
      a.url.trim().length > 0,
  );
  // Khớp FE (hasMeaningfulRichText): chỉ cần có ký tự thật sau khi strip HTML, không ép tối thiểu 3 ký tự
  // (ví dụ "ok" = 2 ký tự vẫn hợp lệ).
  if (!bodyPlain) {
    if (hasImage) return '[Đính kèm ảnh]';
    return null;
  }
  return bodyPlain;
}

export function extractPlainFromTiptapJson(jsonStr: string): string {
  try {
    const node = JSON.parse(jsonStr) as { content?: unknown[]; text?: string };
    const parts: string[] = [];
    const walk = (n: unknown) => {
      if (!n || typeof n !== 'object') return;
      const o = n as { text?: string; content?: unknown[] };
      if (typeof o.text === 'string') parts.push(o.text);
      if (Array.isArray(o.content)) o.content.forEach(walk);
    };
    walk(node);
    return parts
      .join(' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\u00A0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 20000);
  } catch {
    return '';
  }
}

export function containsBannedTerm(
  text: string,
  banned: string[],
): string | null {
  const lower = text.toLowerCase();
  for (const w of banned) {
    if (w && lower.includes(w)) return w;
  }
  return null;
}

export function computeHotScore(
  reactionCount: number,
  commentCount: number,
  createdAt: Date,
): number {
  const hours = Math.max(0, (Date.now() - createdAt.getTime()) / 3600000);
  const score = reactionCount * 1.5 + commentCount * 2;
  return score / Math.pow(hours + 2, 1.35);
}

export function emptyReactionBreakdown(): Record<CommunityReactionKind, number> {
  return {
    [CommunityReactionKind.HELPFUL]: 0,
    [CommunityReactionKind.LOVE]: 0,
    [CommunityReactionKind.QUALITY]: 0,
    [CommunityReactionKind.SPOT_ON]: 0,
    [CommunityReactionKind.THANKS]: 0,
  };
}

export function mergeBreakdown(
  current: Record<string, number> | undefined,
): Record<CommunityReactionKind, number> {
  const base = emptyReactionBreakdown();
  if (!current) return base;
  for (const k of Object.keys(base) as CommunityReactionKind[]) {
    base[k] = Math.max(0, Number(current[k]) || 0);
  }
  return base;
}
