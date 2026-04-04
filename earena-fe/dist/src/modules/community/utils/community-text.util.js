"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.derivePlainFromCommunityBody = derivePlainFromCommunityBody;
exports.resolvePostBodyPlainForSave = resolvePostBodyPlainForSave;
exports.extractPlainFromTiptapJson = extractPlainFromTiptapJson;
exports.containsBannedTerm = containsBannedTerm;
exports.computeHotScore = computeHotScore;
exports.emptyReactionBreakdown = emptyReactionBreakdown;
exports.mergeBreakdown = mergeBreakdown;
const community_constants_1 = require("../constants/community.constants");
function derivePlainFromCommunityBody(raw) {
    const t = raw?.trim();
    if (!t)
        return '';
    if (t.startsWith('{')) {
        const fromJson = extractPlainFromTiptapJson(t);
        if (fromJson)
            return fromJson;
    }
    return t
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 20000);
}
function resolvePostBodyPlainForSave(bodyJson, attachments) {
    let bodyPlain = derivePlainFromCommunityBody(bodyJson);
    const hasImage = (attachments || []).some((a) => a.kind === 'IMAGE' &&
        typeof a.url === 'string' &&
        a.url.trim().length > 0);
    if ((!bodyPlain || bodyPlain.length < 3) && !hasImage) {
        return null;
    }
    if ((!bodyPlain || bodyPlain.length < 3) && hasImage) {
        return '[Đính kèm ảnh]';
    }
    return bodyPlain;
}
function extractPlainFromTiptapJson(jsonStr) {
    try {
        const node = JSON.parse(jsonStr);
        const parts = [];
        const walk = (n) => {
            if (!n || typeof n !== 'object')
                return;
            const o = n;
            if (typeof o.text === 'string')
                parts.push(o.text);
            if (Array.isArray(o.content))
                o.content.forEach(walk);
        };
        walk(node);
        return parts.join(' ').replace(/\s+/g, ' ').trim().slice(0, 20000);
    }
    catch {
        return '';
    }
}
function containsBannedTerm(text, banned) {
    const lower = text.toLowerCase();
    for (const w of banned) {
        if (w && lower.includes(w))
            return w;
    }
    return null;
}
function computeHotScore(reactionCount, commentCount, createdAt) {
    const hours = Math.max(0, (Date.now() - createdAt.getTime()) / 3600000);
    const score = reactionCount * 1.5 + commentCount * 2;
    return score / Math.pow(hours + 2, 1.35);
}
function emptyReactionBreakdown() {
    return {
        [community_constants_1.CommunityReactionKind.HELPFUL]: 0,
        [community_constants_1.CommunityReactionKind.LOVE]: 0,
        [community_constants_1.CommunityReactionKind.QUALITY]: 0,
        [community_constants_1.CommunityReactionKind.SPOT_ON]: 0,
        [community_constants_1.CommunityReactionKind.THANKS]: 0,
    };
}
function mergeBreakdown(current) {
    const base = emptyReactionBreakdown();
    if (!current)
        return base;
    for (const k of Object.keys(base)) {
        base[k] = Math.max(0, Number(current[k]) || 0);
    }
    return base;
}
//# sourceMappingURL=community-text.util.js.map