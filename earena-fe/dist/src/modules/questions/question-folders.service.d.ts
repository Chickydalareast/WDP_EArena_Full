import { QuestionFoldersRepository } from './question-folders.repository';
import { QuestionsRepository } from './questions.repository';
import { CreateFolderPayload, UpdateFolderPayload } from './interfaces/question-folders.interface';
export declare class QuestionFoldersService {
    private readonly foldersRepo;
    private readonly questionsRepo;
    private readonly logger;
    constructor(foldersRepo: QuestionFoldersRepository, questionsRepo: QuestionsRepository);
    createFolder(ownerId: string, payload: CreateFolderPayload): Promise<import("./schemas/question-folder.schema").QuestionFolderDocument>;
    updateFolder(folderId: string, ownerId: string, payload: UpdateFolderPayload): Promise<{
        message: string;
    }>;
    getMyFolders(ownerId: string): Promise<any[]>;
    deleteFolder(folderId: string, ownerId: string): Promise<{
        message: string;
    }>;
}
