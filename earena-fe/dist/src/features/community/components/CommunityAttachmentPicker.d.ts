import type { Dispatch, SetStateAction } from 'react';
import type { CommunityAttachment } from './PostAttachmentsDisplay';
export declare function CommunityAttachmentPicker({ attachments, onChange, disabled, maxImages, }: {
    attachments: CommunityAttachment[];
    onChange: Dispatch<SetStateAction<CommunityAttachment[]>>;
    disabled?: boolean;
    maxImages?: number;
}): any;
