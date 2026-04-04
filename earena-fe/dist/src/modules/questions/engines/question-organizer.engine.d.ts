import { QuestionsRepository } from '../questions.repository';
import { QuestionFoldersRepository } from '../question-folders.repository';
import { KnowledgeTopicsRepository } from '../../taxonomy/knowledge-topics.repository';
import { UsersRepository } from '../../users/users.repository';
import { PreviewOrganizePayload, OrganizePreviewResult } from '../interfaces/question-organizer.interface';
export declare class QuestionOrganizerEngine {
    private readonly questionsRepo;
    private readonly foldersRepo;
    private readonly topicsRepo;
    private readonly usersRepo;
    private readonly logger;
    constructor(questionsRepo: QuestionsRepository, foldersRepo: QuestionFoldersRepository, topicsRepo: KnowledgeTopicsRepository, usersRepo: UsersRepository);
    generateBlueprint(ownerId: string, payload: PreviewOrganizePayload): Promise<OrganizePreviewResult>;
    execute(ownerId: string, payload: PreviewOrganizePayload): Promise<{
        message: string;
        stats: {
            totalQuestions: number;
            newFoldersToCreate: number;
            unclassifiedQuestions: number;
        };
    }>;
}
