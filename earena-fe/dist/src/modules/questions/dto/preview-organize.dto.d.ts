import { OrganizeStrategy } from '../interfaces/question-organizer.interface';
export declare class PreviewOrganizeDto {
    questionIds: string[];
    strategy: OrganizeStrategy;
    baseFolderId?: string;
}
