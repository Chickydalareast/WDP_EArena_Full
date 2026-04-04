import { AttachmentDto } from './create-community-post.dto';
export declare class CreateCommunityCommentDto {
    parentCommentId?: string;
    body?: string;
    attachments?: AttachmentDto[];
    mentionedUserIds?: string[];
}
export declare class UpdateCommunityCommentDto {
    body: string;
}
