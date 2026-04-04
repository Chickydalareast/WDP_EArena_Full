import { CommunityPostType } from '../constants/community.constants';
export declare class AttachmentDto {
    url: string;
    kind: 'IMAGE' | 'FILE';
    name?: string;
    mime?: string;
}
export declare class CreateCommunityPostDto {
    type: CommunityPostType;
    bodyJson: string;
    attachments?: AttachmentDto[];
    tags?: string[];
    subjectId?: string;
    courseId?: string;
    examId?: string;
}
export declare class UpdateCommunityPostDto {
    bodyJson?: string;
    attachments?: AttachmentDto[];
    tags?: string[];
    subjectId?: string;
}
