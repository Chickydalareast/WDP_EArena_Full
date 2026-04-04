import { PaginationQueryDto } from './pagination.dto';
export declare class AdminListQuestionsQueryDto extends PaginationQueryDto {
    search?: string;
    ownerId?: string;
    folderId?: string;
    topicId?: string;
}
export declare class AdminSetQuestionArchiveDto {
    isArchived: boolean;
}
