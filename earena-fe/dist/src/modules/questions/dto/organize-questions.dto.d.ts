import { OrganizeStrategy } from '../interfaces/question-organizer.interface';
export declare class OrganizeQuestionsDto {
    questionIds: string[];
    strategy: OrganizeStrategy;
    baseFolderId?: string;
}
