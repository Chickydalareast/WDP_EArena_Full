import { type ReactNode } from 'react';
type FloatingCtx = {
    openWithPeer: (peerUserId: string, peerDisplayName?: string) => void;
};
export declare function useCommunityFloatingChatOptional(): FloatingCtx | null;
export declare function CommunityFloatingChatShell({ children }: {
    children: ReactNode;
}): any;
export {};
