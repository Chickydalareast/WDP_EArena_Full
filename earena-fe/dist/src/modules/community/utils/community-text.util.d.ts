import { CommunityReactionKind } from '../constants/community.constants';
export declare function derivePlainFromCommunityBody(raw: string): string;
export declare function resolvePostBodyPlainForSave(bodyJson: string, attachments?: {
    kind: string;
    url?: string;
}[]): string | null;
export declare function extractPlainFromTiptapJson(jsonStr: string): string;
export declare function containsBannedTerm(text: string, banned: string[]): string | null;
export declare function computeHotScore(reactionCount: number, commentCount: number, createdAt: Date): number;
export declare function emptyReactionBreakdown(): Record<CommunityReactionKind, number>;
export declare function mergeBreakdown(current: Record<string, number> | undefined): Record<CommunityReactionKind, number>;
