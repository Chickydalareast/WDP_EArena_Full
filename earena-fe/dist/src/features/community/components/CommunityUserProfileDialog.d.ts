type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string | null;
    displayNameHint?: string;
};
export declare function CommunityUserProfileDialog({ open, onOpenChange, userId, displayNameHint, }: Props): any;
export {};
