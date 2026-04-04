export type CommunityAttachment = {
    url: string;
    kind: 'IMAGE' | 'FILE';
    name?: string;
    mime?: string;
};
export declare function PostAttachmentsDisplay({ attachments, className, }: {
    attachments: unknown;
    className?: string;
}): any;
